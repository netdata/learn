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
	redirects, output_path="netlify.toml", static_path="static.toml"
):
	static_part = readRawStaticRedirectsFromFile(static_path)
	static_rules = parseAllRedirects(static_part)
	static_exact = {_normalize_route(source): target for source, target in static_rules if "*" not in source}
	static_wildcards = [
		(source[:-1], target[:-len(":splat")])
		for source, target in static_rules
		if source.endswith("*") and target.endswith(":splat")
	]
	policy_path = pathlib.Path("config/redirect-policy.json")
	retired_sources = set()
	if policy_path.is_file():
		retired_sources = set(json.loads(policy_path.read_text(encoding="utf-8"))["retired_wildcard_sources"])

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


def main(GHLinksCorrelation, ignored_github_repositories=()):

	mapping = reductTonew_learn_pathFromGHLinksCorrelation(GHLinksCorrelation)
	append_entries_to_json(addMovedRedirects(mapping))
	# print(GHLinksCorrelation)
	oldLearn = readLegacyLearnDocMap("LegacyLearnCorrelateLinksWithGHURLs.json")
	# print(oldLearn)
	oldLearn_redirects = UpdateGHLinksBasedOnMap(
		mapping,
		oldLearn,
		ignored_github_repositories=ignored_github_repositories,
	)
	# print(mapping)

	# print(oldLearn)
	finalDict = combineDictsOverwrite(readRedirectsFromFile("netlify.toml"), oldLearn_redirects)
	# print(finalDict)

	active_routes = set(mapping.values())
	finalDict = clean_redirects(finalDict, active_routes)
	# print(unPackedDocument)
	# print(readRawStaticRedirectsFromFile("netlify.toml"))
	
	# print("Links from the legacy learn that are not matched:")
	# for key, value in finalDict.items():
	# 	if value.startswith("https://"):
	# 		print(key, value)
	
	write_netlify_config(finalDict)
	# print(unPackedDocument)


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
