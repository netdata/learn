#!/usr/bin/env bash
# Compares the rendered Learn site before (A) and after (B) a dependency change.
# Local reviewer tool; see scripts/dep-impact/README.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WORK_DIR="${DEP_IMPACT_WORKDIR:-$(dirname "$REPO_ROOT")/learn-dep-impact}"
# Absolute from here on: git -C resolves relative paths from the repo, not from
# the caller's directory, and the results/latest link must work from anywhere.
case "$WORK_DIR" in /*) ;; *) WORK_DIR="$PWD/$WORK_DIR" ;; esac
CONFIG="${DEP_IMPACT_CONFIG:-$SCRIPT_DIR/config.json}"
PORT_A="${DEP_IMPACT_PORT_A:-3101}"
PORT_B="${DEP_IMPACT_PORT_B:-3102}"

PARALLEL=0
SAME_BUILD=0
SKIP_BUILD=0
ALLOW_SCRIPTS=0
UNIT_TESTS=0
FORCE=0
ALWAYS_BROWSER=0
CHILD_PIDS=""

usage() {
  cat <<'EOF'
Usage:
  run.sh setup                        Install this tool's own dependencies (Playwright, Chromium)
  run.sh pr <number> [options]        Compare a pull request against its merge base
  run.sh refs <base> <head> [options] Compare two git revisions
  run.sh calibrate [ref] [options]    Compare a revision against itself (noise baseline, default: origin/master)
  run.sh serve                        Serve the last A and B builds side by side for manual inspection
  run.sh clean                        Remove the worktrees and results

Options:
  --parallel        Build both sides at the same time (needs about 8 GB of free RAM)
  --same-build      calibrate only: serve one build twice (browser noise only, no second build)
  --skip-build      Reuse the worktrees and builds from the previous run
  --allow-scripts   Run dependency install scripts (default: yarn install --ignore-scripts)
  --unit-tests      Also run "yarn test:run" on both sides and compare the results
  --always-browser  Run the browser comparison even when the rendered output is identical
  --force           Run even when the change touches no npm dependency file

Environment:
  DEP_IMPACT_WORKDIR  Work directory (default: ../learn-dep-impact next to the repo)
  DEP_IMPACT_CONFIG   Config file (default: scripts/dep-impact/config.json)
  DEP_IMPACT_PORT_A, DEP_IMPACT_PORT_B  Local ports (default: 3101, 3102)

Exit codes: 0 no impact found, 1 needs attention (regression or visual change), 2 tool or setup problem.
EOF
}

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 2; }

require() {
  local cmd
  for cmd in "$@"; do
    command -v "$cmd" >/dev/null 2>&1 || die "'$cmd' is required but not installed"
  done
}

cleanup() {
  local pid
  for pid in $CHILD_PIDS; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT
trap 'exit 130' INT TERM

setup() {
  require node npm
  log "Installing the checker's dependencies into scripts/dep-impact/node_modules"
  if [ -f "$SCRIPT_DIR/package-lock.json" ]; then
    # Exact versions from the committed lockfile; fails if it disagrees with package.json.
    npm ci --prefix "$SCRIPT_DIR" --ignore-scripts --no-audit --no-fund
  else
    npm install --prefix "$SCRIPT_DIR" --ignore-scripts --no-audit --no-fund
    printf '\nCreated scripts/dep-impact/package-lock.json: commit it so later installs are reproducible.\n'
  fi

  local deps_flag=""
  # Plain Linux hosts such as GitHub runners lack Chromium's system libraries;
  # --with-deps installs them through apt (uses sudo when not root).
  [ "$(uname -s)" != "Linux" ] || deps_flag="--with-deps"
  log "Installing headless Chromium for Playwright${deps_flag:+ (with system dependencies)}"
  # shellcheck disable=SC2086
  (cd "$SCRIPT_DIR" && npx --no-install playwright install $deps_flag chromium)
}

# Builds must use the Node major version Netlify uses, or the result says
# nothing about production. Read from netlify.toml so it cannot drift.
check_node() {
  local required current
  required="$(sed -nE 's/.*NODE_VERSION = "([0-9.]+)".*/\1/p' "$REPO_ROOT/netlify.toml" | head -n 1)"
  [ -n "$required" ] || die "cannot read NODE_VERSION from netlify.toml"
  current="$(node -p 'process.versions.node')"
  [ "${current%%.*}" = "${required%%.*}" ] \
    || die "Node $current detected; Netlify builds with Node $required (netlify.toml). Switch with: nvm use $required"
  [ "$current" = "$required" ] \
    || printf 'warning: Node %s detected; Netlify uses %s. Same major version, continuing.\n' "$current" "$required" >&2
}

resolve_pr() {
  local pr="$1" info base_ref
  require gh
  info="$(gh pr view "$pr" --json baseRefName,headRefOid,title -q '[.baseRefName, .headRefOid, .title] | @tsv')" \
    || die "cannot read PR #$pr with gh"
  IFS=$'\t' read -r base_ref HEAD_SHA TITLE <<<"$info"
  log "PR #$pr: $TITLE"
  git -C "$REPO_ROOT" fetch --quiet origin "$base_ref" "pull/$pr/head"
  git -C "$REPO_ROOT" cat-file -e "$HEAD_SHA^{commit}" || die "PR head $HEAD_SHA not found after fetch"
  BASE_SHA="$(git -C "$REPO_ROOT" merge-base "origin/$base_ref" "$HEAD_SHA")"
  LABEL="pr-$pr"
}

resolve_ref() {
  git -C "$REPO_ROOT" rev-parse --verify --quiet "$1^{commit}" || die "unknown git revision: $1"
}

check_changed_files() {
  local changed unexpected
  changed="$(git -C "$REPO_ROOT" diff --name-only "$BASE_SHA" "$HEAD_SHA")"
  log "Files changed between A and B"
  printf '%s\n' "$changed" | sed 's/^/  /'
  unexpected="$(printf '%s\n' "$changed" | grep -vE '^(package\.json|yarn\.lock|\.github/workflows/|\.learn_environment/)' || true)"
  if [ -n "$unexpected" ]; then
    printf '\nwarning: files outside the dependency manifests changed; review them by hand:\n' >&2
    printf '%s\n' "$unexpected" | sed 's/^/  /' >&2
  fi
  if ! printf '%s\n' "$changed" | grep -qE '^(package\.json|yarn\.lock)$'; then
    if [ "$FORCE" = 0 ]; then
      printf '\nNo npm dependency file changed, so dependencies cannot affect the rendered site. Use --force to compare anyway.\n'
      exit 0
    fi
  fi
}

prepare_worktree() {
  local name="$1" sha="$2" dir="$WORK_DIR/$1"
  if [ -e "$dir" ]; then
    git -C "$REPO_ROOT" worktree remove --force "$dir" 2>/dev/null || rm -rf "$dir"
  fi
  git -C "$REPO_ROOT" worktree prune
  git -C "$REPO_ROOT" worktree add --detach --quiet "$dir" "$sha"
}

install_side() {
  local name="$1" dir="$WORK_DIR/$1"
  local flags="--frozen-lockfile --non-interactive"
  [ "$ALLOW_SCRIPTS" = 1 ] || flags="$flags --ignore-scripts"
  # shellcheck disable=SC2086
  (cd "$dir" && yarn install $flags) >"$WORK_DIR/logs/$name-install.log" 2>&1
}

build_side() {
  local name="$1" dir="$WORK_DIR/$1"
  (cd "$dir" && NODE_OPTIONS="--max-old-space-size=3072" DOCUSAURUS_SSR_CONCURRENCY=4 yarn build) \
    >"$WORK_DIR/logs/$name-build.log" 2>&1
}

build_both() {
  local rcA=0 rcB=0 pidA pidB start
  log "Installing dependencies (logs: $WORK_DIR/logs)"
  install_side A || rcA=$?
  if [ "$SAME_BUILD" = 0 ]; then install_side B || rcB=$?; fi
  [ "$rcA" = 0 ] || die "yarn install failed for A; see $WORK_DIR/logs/A-install.log"
  if [ "$rcB" != 0 ]; then
    BUILD_RESULT="B install failed (exit $rcB); see logs/B-install.log"
    return 1
  fi

  start=$SECONDS
  if [ "$SAME_BUILD" = 1 ]; then
    log "Building A"
    build_side A || rcA=$?
  elif [ "$PARALLEL" = 1 ]; then
    log "Building A and B in parallel"
    build_side A & pidA=$!
    build_side B & pidB=$!
    CHILD_PIDS="$CHILD_PIDS $pidA $pidB"
    wait "$pidA" || rcA=$?
    wait "$pidB" || rcB=$?
  else
    log "Building A"
    build_side A || rcA=$?
    log "Building B"
    build_side B || rcB=$?
  fi
  if [ "$SAME_BUILD" = 1 ]; then
    log "Build finished in $((SECONDS - start))s (exit $rcA; B reuses A)"
  else
    log "Builds finished in $((SECONDS - start))s (A exit $rcA, B exit $rcB)"
  fi

  if [ "$rcA" != 0 ] && [ "$rcB" != 0 ]; then
    die "both builds failed; see $WORK_DIR/logs (environment problem, not the change)"
  elif [ "$rcA" != 0 ]; then
    die "only the base build (A) failed; nothing to compare against. See $WORK_DIR/logs/A-build.log"
  elif [ "$rcB" != 0 ]; then
    BUILD_RESULT="B build failed (exit $rcB) while A builds: the change breaks the build. See logs/B-build.log"
    tail -n 30 "$WORK_DIR/logs/B-build.log" >&2
    return 1
  fi
  BUILD_RESULT="both builds succeeded"
}

unit_tests_both() {
  local rcA=0 rcB=0
  log "Running unit tests on both sides"
  (cd "$WORK_DIR/A" && yarn test:run) >"$WORK_DIR/logs/A-tests.log" 2>&1 || rcA=$?
  (cd "$WORK_DIR/$SIDE_B" && yarn test:run) >"$WORK_DIR/logs/B-tests.log" 2>&1 || rcB=$?
  if [ "$rcA" = 0 ] && [ "$rcB" != 0 ]; then
    UNIT_RESULT="**REGRESSION**: tests pass before the change and fail after it (see logs/B-tests.log)"
    ATTENTION=1
  elif [ "$rcA" != 0 ] && [ "$rcB" != 0 ]; then
    # A failure that already exists in A can hide a new one in B, so this is
    # not proof that the change is harmless.
    UNIT_RESULT="**INCONCLUSIVE**: tests fail on both sides, so a new failure in B could be hidden (compare logs/A-tests.log and logs/B-tests.log)"
    ATTENTION=1
  elif [ "$rcA" != 0 ]; then
    UNIT_RESULT="tests fixed by the change"
  else
    UNIT_RESULT="tests pass on both sides"
  fi
}

http_code() {
  curl -sS -o /dev/null -w '%{http_code}' "$1" 2>/dev/null || true
}

# Serves one side's build and returns once that server answers. The port must
# be free beforehand and our process alive afterwards: otherwise an older
# server (for example "run.sh serve" in another terminal) could answer and the
# comparison would silently use stale builds.
start_server() {
  local name="$1" port="$2" dir="$WORK_DIR/$1" url="http://127.0.0.1:$2/" pid code
  [ "$(http_code "$url")" = "000" ] \
    || die "port $port is already in use (another 'run.sh serve'?). Stop it or set DEP_IMPACT_PORT_A/DEP_IMPACT_PORT_B"
  "$dir/node_modules/.bin/docusaurus" serve "$dir" --dir build --port "$port" --host 127.0.0.1 --no-open \
    >"$WORK_DIR/logs/serve-$port.log" 2>&1 &
  pid=$!
  CHILD_PIDS="$CHILD_PIDS $pid"
  for _ in $(seq 1 60); do
    kill -0 "$pid" 2>/dev/null || die "server for $name on port $port exited; see $WORK_DIR/logs/serve-$port.log"
    code="$(http_code "$url")"
    # Any HTTP answer means it is up: "/" itself is a 404 locally, because the
    # "/" -> "/docs/ask-nedi" redirect exists only in netlify.toml.
    [ "$code" = "000" ] || return 0
    sleep 1
  done
  die "no HTTP answer from $url after 60s; see $WORK_DIR/logs/serve-$port.log"
}

# Prints the summary and exits with the verdict. results/latest always points
# to this run, so callers (people or CI) find the report without parsing output.
finish() {
  local result="$1"
  ln -sfn "$result" "$WORK_DIR/results/latest"
  log "Report: $result/summary.md"
  echo
  cat "$result/summary.md"
  # Hints for a person at a terminal only.
  if [ -t 1 ] && [ -e "$result/report.html" ]; then
    echo
    echo "Visual report:   open \"$result/report.html\""
    echo "Live A/B pages:  $0 serve"
  fi
  exit "$ATTENTION"
}

# Serves the existing A and B builds until Ctrl-C, for side-by-side inspection
# of the same page in two browser tabs (DevTools included).
serve_builds() {
  local side_b=B
  require node curl
  mkdir -p "$WORK_DIR/logs"
  [ -d "$WORK_DIR/A/build" ] || die "no build in $WORK_DIR/A; run a comparison first"
  [ -d "$WORK_DIR/B/build" ] || side_b=A
  start_server A "$PORT_A"
  start_server "$side_b" "$PORT_B"
  log "Serving A (before) on :$PORT_A and B (after) on :$PORT_B$([ "$side_b" = B ] || echo ' (same build)'). Ctrl-C to stop."
  # shellcheck disable=SC2016 # JavaScript template literal, not shell
  node -e '
    const [config, a, b] = process.argv.slice(1);
    for (const page of JSON.parse(require("fs").readFileSync(config, "utf8")).pages) console.log(`  ${page.name.padEnd(12)} ${a}${page.path}   ${b}${page.path}`);
  ' "$CONFIG" "http://127.0.0.1:$PORT_A" "http://127.0.0.1:$PORT_B"
  [ ! -e "$WORK_DIR/results/latest/report.html" ] || echo "  Report: $WORK_DIR/results/latest/report.html"
  # shellcheck disable=SC2086
  wait $CHILD_PIDS
}

main() {
  local mode="${1:-}"
  [ -n "$mode" ] || { usage; exit 2; }
  shift

  case "$mode" in
    -h|--help) usage; exit 0 ;;
    setup) setup; exit 0 ;;
    serve) serve_builds; exit 0 ;;
    clean)
      if [ -d "$WORK_DIR" ]; then
        git -C "$REPO_ROOT" worktree remove --force "$WORK_DIR/A" 2>/dev/null || true
        git -C "$REPO_ROOT" worktree remove --force "$WORK_DIR/B" 2>/dev/null || true
        git -C "$REPO_ROOT" worktree prune
        rm -rf "$WORK_DIR"
      fi
      echo "Removed $WORK_DIR"
      exit 0
      ;;
  esac

  local positional=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --parallel) PARALLEL=1 ;;
      --same-build) SAME_BUILD=1 ;;
      --skip-build) SKIP_BUILD=1 ;;
      --allow-scripts) ALLOW_SCRIPTS=1 ;;
      --unit-tests) UNIT_TESTS=1 ;;
      --always-browser) ALWAYS_BROWSER=1 ;;
      --force) FORCE=1 ;;
      -*) die "unknown option: $1" ;;
      *) positional="$positional $1" ;;
    esac
    shift
  done
  # shellcheck disable=SC2086
  set -- $positional

  require git node yarn curl
  check_node
  [ -d "$SCRIPT_DIR/node_modules/playwright" ] || die "run '$0 setup' first"

  TITLE=""
  case "$mode" in
    pr)
      [ $# -eq 1 ] || die "usage: run.sh pr <number>"
      resolve_pr "$1"
      ;;
    refs)
      [ $# -eq 2 ] || die "usage: run.sh refs <base> <head>"
      BASE_SHA="$(resolve_ref "$1")"
      HEAD_SHA="$(resolve_ref "$2")"
      LABEL="refs"
      ;;
    calibrate)
      local ref="${1:-origin/master}"
      [ "$ref" != "origin/master" ] || git -C "$REPO_ROOT" fetch --quiet origin master
      BASE_SHA="$(resolve_ref "$ref")"
      HEAD_SHA="$BASE_SHA"
      LABEL="calibrate"
      FORCE=1
      ALWAYS_BROWSER=1
      ;;
    *) usage; exit 2 ;;
  esac
  [ "$SAME_BUILD" = 0 ] || [ "$mode" = calibrate ] || die "--same-build only works with calibrate"

  SIDE_B=B
  [ "$SAME_BUILD" = 0 ] || SIDE_B=A

  log "A (before): $BASE_SHA"
  log "B (after):  $HEAD_SHA"
  [ "$mode" = calibrate ] || check_changed_files

  mkdir -p "$WORK_DIR/logs"
  local stamp result
  stamp="$(date +%Y%m%d-%H%M%S)"
  result="$WORK_DIR/results/$LABEL-$stamp"
  mkdir -p "$result"
  ATTENTION=0
  BUILD_RESULT="reused builds from the previous run (--skip-build)"
  UNIT_RESULT="not run (use --unit-tests)"

  if [ "$SKIP_BUILD" = 1 ]; then
    if [ ! -d "$WORK_DIR/A/build" ] || [ ! -d "$WORK_DIR/$SIDE_B/build" ]; then die "--skip-build: no previous builds in $WORK_DIR"; fi
    [ "$(git -C "$WORK_DIR/A" rev-parse HEAD)" = "$BASE_SHA" ] || die "--skip-build: worktree A is not at $BASE_SHA"
    [ "$(git -C "$WORK_DIR/$SIDE_B" rev-parse HEAD)" = "$HEAD_SHA" ] || die "--skip-build: worktree B is not at $HEAD_SHA"
  else
    log "Preparing worktrees in $WORK_DIR"
    prepare_worktree A "$BASE_SHA"
    [ "$SAME_BUILD" = 1 ] || prepare_worktree B "$HEAD_SHA"
    if ! build_both; then
      ATTENTION=1
    fi
  fi

  {
    echo "# Dependency impact: $LABEL"
    echo
    [ -z "$TITLE" ] || echo "PR: $TITLE"
    echo
    echo "- A (before): \`$BASE_SHA\`"
    echo "- B (after): \`$HEAD_SHA\`$([ "$SAME_BUILD" = 0 ] || echo ' (same build served twice)')"
    echo "- Build: $BUILD_RESULT"
  } >"$result/summary.md"

  if [ "$ATTENTION" = 1 ]; then
    echo "- **Verdict: NEEDS ATTENTION** (build)" >>"$result/summary.md"
    finish "$result"
  fi

  if [ "$UNIT_TESTS" = 1 ]; then unit_tests_both; fi
  echo "- Unit tests: $UNIT_RESULT" >>"$result/summary.md"
  echo >>"$result/summary.md"

  log "Comparing rendered output"
  node "$SCRIPT_DIR/compare-output.mjs" --a "$WORK_DIR/A/build" --b "$WORK_DIR/$SIDE_B/build" \
    --a-root "$WORK_DIR/A" --b-root "$WORK_DIR/$SIDE_B" \
    --config "$CONFIG" --json "$result/output.json" --markdown "$result/output.md"
  cat "$result/output.md" >>"$result/summary.md"

  local identical
  identical="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).identical' "$result/output.json")"
  if [ "$identical" = "true" ] && [ "$ALWAYS_BROWSER" = 0 ]; then
    echo "Browser comparison skipped: identical output means identical pages. Use --always-browser to run it anyway." >>"$result/summary.md"
  else
    log "Serving A on :$PORT_A and B on :$PORT_B"
    start_server A "$PORT_A"
    start_server "$SIDE_B" "$PORT_B"

    log "Comparing pages in the browser"
    local rc=0
    node "$SCRIPT_DIR/browser-check.mjs" --a "http://127.0.0.1:$PORT_A" --b "http://127.0.0.1:$PORT_B" \
      --config "$CONFIG" --out "$result" || rc=$?
    # Only 0 and 1 are verdicts; anything else is the tool failing, never the change.
    case "$rc" in
      0) ;;
      1) ATTENTION=1 ;;
      *) die "browser check failed to run (exit $rc); this is a tool or environment problem, not the change" ;;
    esac
    [ -f "$result/browser.md" ] || die "browser check produced no report"
    cat "$result/browser.md" >>"$result/summary.md"
  fi

  {
    echo
    if [ "$ATTENTION" = 1 ]; then
      echo "**Verdict: NEEDS ATTENTION.** Read the problems above, then open the visual report."
    else
      echo "**Verdict: NO IMPACT FOUND.**"
    fi
  } >>"$result/summary.md"

  finish "$result"
}

main "$@"
