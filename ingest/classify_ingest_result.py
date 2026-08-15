#!/usr/bin/env python3

"""Classify a completed Learn ingest without confusing crashes with link debt."""

import argparse
import sys


SUCCESS_MARKER = "OPERATION FINISHED - SUCCESS (exit code: 0)"
BROKEN_LINK_MARKER = "OPERATION FINISHED - FAILURE (exit code: 1)"
BROKEN_LINK_REASON = "Broken links detected matching failure criteria"


class IncompleteIngestError(RuntimeError):
    """Raised when process status and final ingest evidence do not agree."""


def classify_result(exit_code, output):
    success_count = output.count(SUCCESS_MARKER)
    broken_count = output.count(BROKEN_LINK_MARKER)
    reason_count = output.count(BROKEN_LINK_REASON)

    if exit_code == 0 and (success_count, broken_count, reason_count) == (1, 0, 0):
        return "success"
    if exit_code == 1 and (success_count, broken_count, reason_count) == (0, 1, 1):
        return "broken_links"

    raise IncompleteIngestError(
        "Ingest did not reach one recognized final state "
        f"(exit={exit_code}, success_markers={success_count}, "
        f"broken_link_markers={broken_count}, broken_link_reasons={reason_count})"
    )


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("exit_code", type=int)
    args = parser.parse_args(argv)
    output = sys.stdin.read()
    try:
        result = classify_result(args.exit_code, output)
    except IncompleteIngestError as error:
        print(error, file=sys.stderr)
        return 2
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
