import argparse
import copy
import glob
import itertools
import os
import pathlib
import re
import shutil
import errno
import git
import json
import ast
import subprocess
import yaml
import autogenerateSupportedIntegrationsPage as genIntPage
import pandas as pd
import numpy as np
from urllib.parse import urlsplit, urlunsplit


def redirectUnit(FROM, TO):
	unit = f"""
[[redirects]]
  from="{FROM}"
  to="{TO}"
"""
	return (unit)


def combineDictsJU(dict1, dict2):
    """
    Combine two Irreconcilable dictionaries, if they are not Irreconcilable, raising error.
    """
    new_dict = {}
    for key in dict1:
        if key in new_dict:
            raise Exception(f"Key '{key}' already exists in the new dictionary and will be overwritten.")
        new_dict[key] = dict1[key]

    # Iterate through the keys in dict2 and add them to the new_dict
    for key in dict2:
        if key in new_dict:
            raise Exception(f"Key '{key}' already exists in the new dictionary and will be overwritten.")
        new_dict[key] = dict2[key]

    return (new_dict)


def combineDictsOverwrite(dict1, dict2):
    """
    Combine redirect dictionaries while rejecting conflicting deployment identities.
    """
    new_dict = dict1.copy()
    identities = {_normalize_route(key): _target_identity(value) for key, value in new_dict.items()}
    for key in dict2:
        identity = _normalize_route(key)
        normalized_value = _target_identity(dict2[key])
        previous = identities.get(identity)
        if previous is not None and previous != normalized_value:
            raise ValueError(
                f"Conflicting redirect identity {identity}: {previous} and {normalized_value}"
            )
        identities[identity] = normalized_value
        new_dict[key] = dict2[key]
    return (new_dict)


def reductTonew_learn_pathFromGHLinksCorrelation(inputMatrix):
    """
    This function takes as an argument our Matrix of the Ingest process and creates a new dictionary with key value
    pairs the Source file (keys) to the Target file (value: learn_absolute path)
    """
    outputDictionary = dict()
    for x in inputMatrix:
        outputDictionary[inputMatrix[x]["metadata"]["custom_edit_url"]] = inputMatrix[x]["new_learn_path"]
        outputDictionary[inputMatrix[x]["metadata"]["custom_edit_url"].replace("/edit/", "/blob/")] = inputMatrix[x]["new_learn_path"]
    return (outputDictionary)


def readRawStaticRedirectsFromFile(pathToFile):
	"""
	This function reads the netlify.toml file, identifies
	the static section between # section: static START|END
	and saves them into a multiline string.
	"""
	redirects = ""
	section_pattern = re.compile(r'#\s*section:\s*static\s*<<\s*START(.+?)#\s*section:\s*static\s*<<\s*END', re.DOTALL)
	with open(pathToFile, "r") as fd:
		document_text = "".join(fd.readlines())
		sections = section_pattern.findall(document_text)
		redirects += "".join(sections)
	return (redirects)


def parseRedirects(document_text):
	redirects = dict()
	identities = dict()
	section_pattern = re.compile(r'#\s*section:\s*dynamic\s*<<\s*START(.+?)#\s*section:\s*dynamic\s*<<\s*END', re.DOTALL)
	redirects_pattern = re.compile(r'\[\[redirects\]\]\s+from\s*=\s*"(.+?)"\s+to\s*=\s*"(.+?)"')
	for section in section_pattern.findall(document_text):
		for key, value in redirects_pattern.findall(section):
			identity = _normalize_route(key)
			normalized_value = _target_identity(value)
			previous = identities.get(identity)
			if previous is not None and previous != normalized_value:
				raise ValueError(
					f"Conflicting redirect identity {identity}: {previous} and {normalized_value}"
				)
			identities[identity] = normalized_value
			redirects[key] = value
	return redirects


def parseAllRedirects(document_text):
	redirects_pattern = re.compile(r'\[\[redirects\]\]\s+from\s*=\s*"(.+?)"\s+to\s*=\s*"(.+?)"')
	return redirects_pattern.findall(document_text)


def readRedirectsFromFile(pathToFile):
	"""
	This function reads the netlify.toml file, identifies
	the dynamic section between # section: dynamic START|END
	and parse all the [[redirect]] rules in a dictionary.
	"""
	with open(pathToFile, "r") as fd:
		document_text = "".join(fd.readlines())
	return parseRedirects(document_text)


def readLegacyLearnDocMap(pathToFile):
	"""
	This function reads the LegacyLearnCorrelateLinksWithGHURLs.json
	file, identifies,and creates a map where the old documents of learn
	are located in a dictionary
	"""
	finalDict = dict()
	with open(pathToFile) as json_file:
		return ({key.replace("https://learn.netdata.cloud", ""): value for key, value in json.load(json_file).items()})


def _github_repository_identity(url):
	parts = urlsplit(url)
	if parts.scheme not in {"http", "https"} or parts.netloc.lower() != "github.com":
		return None
	segments = [segment for segment in parts.path.split("/") if segment]
	if len(segments) < 2:
		return None
	return f"{segments[0]}/{segments[1]}".lower()


def UpdateGHLinksBasedOnMap(
	mapMatrix, inputDictionary, ignored_github_repositories=()
):
	ignored = {repository.lower() for repository in ignored_github_repositories}
	updated = {}
	for k, v in inputDictionary.items():
		if v in mapMatrix.keys():
			updated[k] = mapMatrix[v]
		elif _github_repository_identity(v) not in ignored:
			updated[k] = v
	return (updated)


def addMovedRedirects(mapping):
	# A function that covers adding redirects for moved files.
	# Reads one_commit_back, that is how the map was before these changes,
	# and has the current mapping from the mapping variable.

	with open("./ingest/one_commit_back_file-dict.yaml", "r", encoding="utf-8") as fh:
		redirect_list = yaml.safe_load(fh) or []
	one_commit_back = {item['custom_edit_url']: item for item in redirect_list}

	redirects = {}

	# Check every custom_edit_url that is inside the new map
	for custom_edit_url in mapping.keys():
		custom_edit_url = custom_edit_url.replace("blob", "edit")
		# if it exists also inside the old map, check if we need a redirect
		if custom_edit_url in one_commit_back.keys():
			old = one_commit_back[custom_edit_url]['learn_path']  # /docs/oldpath...
			new = mapping[custom_edit_url]  # /docs/newpath...
			# if the two paths are different, add a redirect entry to the dictionary, in the format:
			# https://learn.netdata.cloud/docs/oldpath... : https://github.com/absolute path...
			if new != old:
				# print(new , old)
				redirects.update({"https://learn.netdata.cloud" + old: custom_edit_url.replace("edit", "blob")})

	# print(redirects)

	# This is mostly for precaution, it *might* also work without sorting everything
	keys = list(redirects.keys())
	keys.sort(reverse=True)
	redirects = {i: redirects[i] for i in keys}

	return redirects


def append_entries_to_json(dictionary):
	# This function is responsible for appending new entries to the LegacyLearnCorrelateLinksWithGHURLs.json file

	with open("LegacyLearnCorrelateLinksWithGHURLs.json", "r") as json_file:
		json_dictionary = json.load(json_file)

	with open("LegacyLearnCorrelateLinksWithGHURLs.json", "w+") as json_file:
		for key in dictionary:
			json_dictionary.update({key: dictionary[key]})

		# print(len(json_dictionary))
		json.dump(json_dictionary, json_file, indent=4)


def _normalize_route(route):
	if not route:
		return "/"
	path = urlsplit(route).path
	if not path.startswith("/"):
		path = "/" + path
	return path.rstrip("/") or "/"


def _target_identity(target):
	parts = urlsplit(target)
	if parts.scheme in {"http", "https"} and parts.netloc:
		path = parts.path.rstrip("/") or "/"
		return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, parts.query, parts.fragment))
	return _normalize_route(target)


POLICY_PATH = "config/redirect-policy.json"
LEGACY_CATALOGUE_PATH = "LegacyLearnCorrelateLinksWithGHURLs.json"
RETIREMENT_FIELDS = ("route", "source", "reason", "evidence", "reviewed")


class LegacyRedirectGateError(Exception):
	"""A legacy catalogue entry is neither resolved, retained by a live tracked redirect, nor retired."""


def _is_external_target(target):
	return target.startswith("https://") or target.startswith("http://")


def read_legacy_catalogue_retirements(policy_path=POLICY_PATH):
	"""Return the reviewed catalogue retirements keyed by normalized route.

	Every retirement must carry the route, the catalogue source it retires, the reason,
	the source-history evidence, and the review date. Incomplete entries are rejected so
	the inventory cannot widen silently.
	"""
	policy_file = pathlib.Path(policy_path)
	if not policy_file.is_file():
		return {}
	policy = json.loads(policy_file.read_text(encoding="utf-8"))
	retirements = {}
	for entry in policy.get("legacy_catalogue_retirements", []):
		missing = [
			field
			for field in RETIREMENT_FIELDS
			if not entry.get(field) or (isinstance(entry.get(field), list) and not any(entry[field]))
		]
		if missing:
			raise ValueError(
				f"Incomplete legacy catalogue retirement {entry.get('route')!r}: missing {', '.join(missing)}"
			)
		route = _normalize_route(entry["route"])
		if route in retirements:
			raise ValueError(f"Duplicate legacy catalogue retirement for {route}")
		retirements[route] = entry
	return retirements


def _covering_rule(route, exact_rules, wildcard_rules):
	"""Return the target a set of redirect rules produces for route, or None."""
	target = exact_rules.get(route)
	if target is not None:
		return target
	for source_prefix, target_prefix in wildcard_rules:
		if route.startswith(source_prefix):
			return target_prefix + route[len(source_prefix):]
	return None


def gate_legacy_redirects(
	legacy_redirects,
	tracked_redirects,
	active_routes,
	static_path="static.toml",
	policy_path=POLICY_PATH,
):
	"""Classify catalogue-derived redirects before they are merged with the tracked rules.

	Each legacy route is one of:
	- resolved: the catalogue source is a published page, so its current redirect is generated;
	- retained: the source is unresolved but a static rule or a tracked redirect to a live page
	  already covers the route, so that redirect is kept and the stale entry is reported;
	- retired: the source is unresolved and config/redirect-policy.json records a reviewed
	  retirement for exactly this route and source;
	- failed: anything else. The caller must fail instead of dropping the entry.

	Static rules are human-owned and verified against rendered routes by the post-build
	redirect gate, so they are trusted without a liveness check; tracked dynamic rules must
	target a route in active_routes.
	"""
	active = {_normalize_route(route) for route in active_routes}
	tracked_exact = {
		_normalize_route(source): target for source, target in tracked_redirects.items() if "*" not in source
	}
	tracked_wildcards = [
		(source[:-1], target[: -len(":splat")])
		for source, target in tracked_redirects.items()
		if source.endswith("*") and target.endswith(":splat")
	]
	# The static section and the policy are consulted only for unresolved entries.
	coverage = {}

	def reviewed_coverage():
		if not coverage:
			static_rules = parseAllRedirects(readRawStaticRedirectsFromFile(static_path))
			coverage["retirements"] = read_legacy_catalogue_retirements(policy_path)
			coverage["static_exact"] = {
				_normalize_route(source): target for source, target in static_rules if "*" not in source
			}
			coverage["static_wildcards"] = [
				(source[:-1], target[: -len(":splat")])
				for source, target in static_rules
				if source.endswith("*") and target.endswith(":splat")
			]
		return coverage

	result = {"resolved": {}, "retained": [], "retired": [], "failed": []}
	for route, target in legacy_redirects.items():
		if not _is_external_target(target):
			result["resolved"][route] = target
			continue
		identity = _normalize_route(route)
		reviewed = reviewed_coverage()
		retirement = reviewed["retirements"].get(identity)
		if retirement is not None:
			if retirement["source"] == target:
				result["retired"].append({"route": route, "source": target})
				continue
			result["failed"].append(
				{
					"route": route,
					"source": target,
					"detail": f"policy retirement names a different source: {retirement['source']}",
				}
			)
			continue
		static_target = _covering_rule(identity, reviewed["static_exact"], reviewed["static_wildcards"])
		if static_target is not None:
			result["retained"].append(
				{"route": route, "source": target, "redirect": static_target, "kind": "static"}
			)
			continue
		tracked_target = _covering_rule(identity, tracked_exact, tracked_wildcards)
		if tracked_target is not None:
			if not _is_external_target(tracked_target) and _normalize_route(tracked_target) in active:
				result["retained"].append(
					{"route": route, "source": target, "redirect": tracked_target, "kind": "tracked"}
				)
				continue
			result["failed"].append(
				{
					"route": route,
					"source": target,
					"detail": f"tracked redirect target is not a published page: {tracked_target}",
				}
			)
			continue
		result["failed"].append({"route": route, "source": target, "detail": "no tracked redirect"})
	return result


def format_legacy_redirect_report(gate_result):
	lines = [
		"### Legacy redirect catalogue gate ###",
		f"Resolved catalogue entries: {len(gate_result['resolved'])}",
		f"Retired by {POLICY_PATH}: {len(gate_result['retired'])}",
		f"Stale catalogue entries kept by an existing redirect: {len(gate_result['retained'])}",
	]
	for entry in gate_result["retained"]:
		lines.append(
			f"  - STALE https://learn.netdata.cloud{entry['route']} -> {entry['redirect']} "
			f"({entry['kind']} redirect kept) | missing source: {entry['source']}"
		)
	if gate_result["retained"]:
		lines.append(
			"  Migrate each stale entry in "
			f"{LEGACY_CATALOGUE_PATH}: repoint it to the GitHub source of the page it should reach, "
			f"or record a reviewed retirement in {POLICY_PATH}."
		)
	return "\n".join(lines)


def format_legacy_redirect_failure(gate_result):
	failed = gate_result["failed"]
	lines = [
		"### LEGACY REDIRECT CATALOGUE GATE FAILED ###",
		f"{len(failed)} historical learn.netdata.cloud URL(s) in {LEGACY_CATALOGUE_PATH} point at a GitHub "
		"source that is not a published Learn page and have neither a live tracked redirect nor a reviewed "
		"retirement. Without a redirect these URLs return 404.",
	]
	for entry in failed:
		lines.append(
			f"  - https://learn.netdata.cloud{entry['route']} | missing source: {entry['source']} "
			f"| {entry['detail']}"
		)
	lines.append(
		"Do not weaken this gate. A Learn catalogue migration is required in netdata/learn: repoint each "
		f"entry in {LEGACY_CATALOGUE_PATH} to the GitHub source of the page it should reach (the moved file, "
		"or a reviewed replacement page), or record a reviewed retirement with route, source, reason, "
		f"evidence and review date under legacy_catalogue_retirements in {POLICY_PATH}."
	)
	return "\n".join(lines)


def clean_redirects(redirects, active_routes=()):
	"""Remove redirects that shadow live routes and collapse internal chains."""
	active = {_normalize_route(route) for route in active_routes}
	candidates = {}
	targets_by_identity = {}
	for source, target in redirects.items():
		normalized_source = _normalize_route(source)
		if normalized_source in active:
			continue
		if target.startswith("https://") or target.startswith("http://"):
			continue
		if normalized_source == _normalize_route(target):
			continue
		normalized_target = _normalize_route(target)
		previous_target = targets_by_identity.get(normalized_source)
		if previous_target is not None and previous_target != normalized_target:
			raise ValueError(
				f"Conflicting redirect identity {normalized_source}: "
				f"{previous_target} and {normalized_target}"
			)
		targets_by_identity[normalized_source] = normalized_target
		candidates.setdefault(normalized_source, target)

	targets_by_route = {}
	for source, target in candidates.items():
		targets_by_route.setdefault(_normalize_route(source), target)

	cleaned = {}
	for source, initial_target in candidates.items():
		target = initial_target
		visited = {_normalize_route(source)}
		while True:
			target_route = _normalize_route(target)
			if target_route in visited:
				target = None
				break
			visited.add(target_route)
			next_target = targets_by_route.get(target_route)
			if next_target is None:
				break
			target = next_target

		if target is not None and _normalize_route(source) != _normalize_route(target):
			cleaned[source] = target

	return cleaned


def discover_current_routes(docs_path="docs", sitemap_path=None):
	routes = set()
	learn_link_pattern = re.compile(
		r'^learn_link:\s*["\']?https://learn\.netdata\.cloud([^"\'\s]+)', re.MULTILINE
	)
	slug_pattern = re.compile(r'^slug:\s*["\']?([^"\'\s]+)', re.MULTILINE)

	for doc_path in pathlib.Path(docs_path).rglob("*.mdx"):
		try:
			front_matter = doc_path.read_text(encoding="utf-8")[:8000]
		except (OSError, UnicodeDecodeError):
			continue
		match = learn_link_pattern.search(front_matter)
		if match:
			routes.add(_normalize_route(match.group(1)))
			continue
		match = slug_pattern.search(front_matter)
		if match:
			routes.add(_normalize_route("/docs/" + match.group(1).lstrip("/")))

	if sitemap_path and pathlib.Path(sitemap_path).is_file():
		sitemap = pathlib.Path(sitemap_path).read_text(encoding="utf-8")
		for url in re.findall(r"<loc>(.*?)</loc>", sitemap):
			routes.add(_normalize_route(url))

	return routes


def write_netlify_config(
	redirects, output_path="netlify.toml", static_path="static.toml", policy_path=POLICY_PATH
):
	static_part = readRawStaticRedirectsFromFile(static_path)
	static_rules = parseAllRedirects(static_part)
	static_exact = {_normalize_route(source): target for source, target in static_rules if "*" not in source}
	static_wildcards = [
		(source[:-1], target[:-len(":splat")])
		for source, target in static_rules
		if source.endswith("*") and target.endswith(":splat")
	]
	policy_file = pathlib.Path(policy_path)
	retired_sources = set()
	if policy_file.is_file():
		retired_sources = set(json.loads(policy_file.read_text(encoding="utf-8"))["retired_wildcard_sources"])

	owned_redirects = {}
	for source, target in redirects.items():
		if source in retired_sources or _normalize_route(source) in static_exact:
			continue
		subsumed = False
		for source_prefix, target_prefix in static_wildcards:
			if source.startswith(source_prefix):
				remainder = source[len(source_prefix):]
				expected_target = target_prefix + remainder
				if _normalize_route(target) != _normalize_route(expected_target):
					raise ValueError(
						f"Static wildcard conflicts with generated redirect {source}: "
						f"expected {expected_target}, found {target}"
					)
				subsumed = True
				break
		if not subsumed:
			owned_redirects[source] = target

	unPackedDynamicPart = ''.join(
		redirectUnit(key, value) for key, value in owned_redirects.items()
	)
	unPackedStaticPart = static_part
	outputRedirectsFile = f"""# This document is autogenerated, to make your change permanently, include it in the static section.
# section: static << START{unPackedStaticPart}# section: static << END

# section: dynamic << START
{unPackedDynamicPart}
# section: dynamic << END"""

	with open(output_path, "w", encoding="utf-8") as output_file:
		output_file.write(outputRedirectsFile)


def refresh_current_netlify_config():
	active_routes = discover_current_routes(
		"docs",
		"build/sitemap.xml" if pathlib.Path("build/sitemap.xml").is_file() else None,
	)
	tracked_redirects = {}
	try:
		tracked_config = subprocess.run(
			["git", "show", "HEAD:netlify.toml"],
			check=True,
			capture_output=True,
			text=True,
		).stdout
		tracked_redirects = parseRedirects(tracked_config)
	except (OSError, subprocess.CalledProcessError):
		pass
	current_redirects = readRedirectsFromFile("netlify.toml")
	tracked_routes = {_normalize_route(source) for source in tracked_redirects}
	current_redirects = {
		source: target
		for source, target in current_redirects.items()
		if source in tracked_redirects or _normalize_route(source) not in tracked_routes
	}
	redirects = combineDictsOverwrite(tracked_redirects, current_redirects)
	redirects = clean_redirects(redirects, active_routes)
	write_netlify_config(redirects)
	return redirects


def main(
	GHLinksCorrelation,
	ignored_github_repositories=(),
	netlify_path="netlify.toml",
	static_path="static.toml",
	policy_path=POLICY_PATH,
):
	mapping = reductTonew_learn_pathFromGHLinksCorrelation(GHLinksCorrelation)
	append_entries_to_json(addMovedRedirects(mapping))
	oldLearn = readLegacyLearnDocMap(LEGACY_CATALOGUE_PATH)
	oldLearn_redirects = UpdateGHLinksBasedOnMap(
		mapping,
		oldLearn,
		ignored_github_repositories=ignored_github_repositories,
	)

	tracked_redirects = readRedirectsFromFile(netlify_path)
	active_routes = set(mapping.values())
	# Unresolved catalogue entries never reach clean_redirects: they are retained by an
	# existing redirect, retired by policy, or fatal. Only resolved entries are merged.
	gate_result = gate_legacy_redirects(
		oldLearn_redirects,
		tracked_redirects,
		active_routes,
		static_path=static_path,
		policy_path=policy_path,
	)
	print(format_legacy_redirect_report(gate_result))
	if gate_result["failed"]:
		raise LegacyRedirectGateError(format_legacy_redirect_failure(gate_result))

	finalDict = combineDictsOverwrite(tracked_redirects, gate_result["resolved"])
	finalDict = clean_redirects(finalDict, active_routes)
	write_netlify_config(
		finalDict, output_path=netlify_path, static_path=static_path, policy_path=policy_path
	)
	return gate_result


if __name__ == "__main__":
	parser = argparse.ArgumentParser(description="Regenerate Learn redirect configuration")
	parser.add_argument(
		"--refresh-current",
		action="store_true",
		help="Clean current generated redirects and resync the static Netlify configuration.",
	)
	args = parser.parse_args()
	if args.refresh_current:
		refresh_current_netlify_config()
