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
import autogenerateSupportedIntegrationsPage as genIntPage
import pandas as pd
import numpy as np



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
            raise Exception(
            	f"Key '{key}' already exists in the new dictionary and will be overwritten.")
        new_dict[key] = dict1[key]

    # Iterate through the keys in dict2 and add them to the new_dict
    for key in dict2:
        if key in new_dict:
            raise Exception(
            	f"Key '{key}' already exists in the new dictionary and will be overwritten.")
        new_dict[key] = dict2[key]

    return (new_dict)


def combineDictsOverwrite(dict1, dict2):
    """
    Combine two dictionaries and overwrite common keys of d1, d2 based on keys, values.
    """
    new_dict = dict1.copy()
    for key in dict2:
        new_dict[key] = dict2[key]
    return (new_dict)


def reductTonewLearnPathFromGHLinksCorrelation(inputMatrix):
    """
    This function takes as an argument our Matrix of the Ingest process and creates a new dictionary with key value
    pairs the Source file (keys) to the Target file (value: learn_absolute path)
    """
    outputDictionary = dict()
    for x in inputMatrix:
        outputDictionary[inputMatrix[x]["metadata"]
                         ["custom_edit_url"]] = inputMatrix[x]["newLearnPath"]
        outputDictionary[inputMatrix[x]["metadata"]["custom_edit_url"].replace(
            "/edit/", "/blob/")] = inputMatrix[x]["newLearnPath"]
    return (outputDictionary)


def readRawStaticRedirectsFromFile(pathToFile):
	"""
	This function reads the netlify.toml file, identifies
	the static section between # section: static START|END
	and saves them into a multiline string.
	"""
	redirects = ""
	section_pattern = re.compile(
		r'#\s*section:\s*static\s*<<\s*START(.+?)#\s*section:\s*static\s*<<\s*END', re.DOTALL)
	with open(pathToFile, "r+") as fd:
		document_text = "".join(fd.readlines())
		sections = section_pattern.findall(document_text)
		redirects += "".join(sections)
	return (redirects)


def readRedirectsFromFile(pathToFile):
	"""
	This function reads the netlify.toml file, identifies
	the dynamic section between # section: dynamic START|END
	and parse all the [[redirect]] rules in a dictionary.
	"""
	redirects = dict()
	section_pattern = re.compile(
		r'#\s*section:\s*dynamic\s*<<\s*START(.+?)#\s*section:\s*dynamic\s*<<\s*END', re.DOTALL)
	redirects_pattern = re.compile(
		r'\[\[redirects\]\]\s+from\s*=\s*"(.+?)"\s+to\s*=\s*"(.+?)"')
	with open(pathToFile, "r+") as fd:
		document_text = "".join(fd.readlines())
		sections = section_pattern.findall(document_text)
		for section in sections:
			redirectsList = redirects_pattern.findall(section)

		for k, v in redirectsList.__iter__():
			redirects[k] = v
	return (redirects)


def readLegacyLearnDocMap(pathToFile):
	"""
	This function reads the LegacyLearnCorrelateLinksWithGHURLs.json
	file, identifies,and creates a map where the old documents of learn
	are located in a dictionary
	"""
	finalDict = dict()
	with open(pathToFile) as json_file:
		return ({key.replace("https://learn.netdata.cloud", ""): value for key, value in json.load(json_file).items()})


def UpdateGHLinksBasedOnMap(mapMatrix, inputDictionary):
	for k, v in inputDictionary.items():
		if v in mapMatrix.keys():
			inputDictionary[k] = mapMatrix[v]
		else:
			pass
	return (inputDictionary)

def addMovedRedirects(mapping, finalDict):
	# A function that covers adding redirects for (most) moved directories

	# Read the two maps, map_dict is the new one with the moved elements,
	# and the one_commit_back, is how the map was before these changes.

	one_commit_back = pd.read_csv(
		"./ingest/one_commit_back_file-dict.tsv",sep='\t').set_index('custom_edit_url').T.to_dict('dict')

	redirects = {}


	# Check every custom_edit_url that is inside the new map
	for custom_edit_url in mapping.keys():
		custom_edit_url = custom_edit_url.replace("blob", "edit")
		# print(one_commit_back.keys())
		# exit()
		# print(mapping[custom_edit_url] , one_commit_back[custom_edit_url])
		if custom_edit_url in one_commit_back.keys():
			old = one_commit_back[custom_edit_url]['learn_path']
			new = mapping[custom_edit_url]
			# print(old , mapping[custom_edit_url], mapping[custom_edit_url] != old)
			if new != old:
				# print(new , old)
				redirects.update({old: new})
			

	# print(redirects)

	keys = list(redirects.keys())
	keys.sort(reverse= True)
	redirects = {i: redirects[i] for i in keys}

	return redirects


def redirect_string_from_dict(dictionary):
	output_string = ""

	for key in dictionary:
		output_string += f"\n[[redirects]]\n  from=\"{key}\"\n  to=\"{dictionary[key]}\"\n"

	# print(output_string)

	return output_string


def main(GHLinksCorrelation):

	mapping = reductTonewLearnPathFromGHLinksCorrelation(GHLinksCorrelation)
	# print(GHLinksCorrelation)
	oldLearn = readLegacyLearnDocMap("LegacyLearnCorrelateLinksWithGHURLs.json")
	# print(oldLearn)
	oldLearn_redirects = UpdateGHLinksBasedOnMap(mapping, oldLearn)
	# print(mapping)

	# print(oldLearn)
	try:
		finalDict = combineDictsOverwrite(
			readRedirectsFromFile("netlify.toml"), oldLearn_redirects)
		# print(finalDict)
	except Exception as e:
		print(f"An exception occurred: {e}")
	unPackedDynamicPart = ''
	for key, value in finalDict.items():
		if not value.startswith("https://"):
			unPackedDynamicPart += redirectUnit(key, value)
	# print(unPackedDocument)
	# print(readRawStaticRedirectsFromFile("netlify.toml"))
	print("Links from the legacy learn that are not matched:")
	for key, value in finalDict.items():
		if value.startswith("https://"):
			print(key, value)
	unPackedStaticPart = readRawStaticRedirectsFromFile("netlify.toml")
	outputRedirectsFile = f"""# This document is autogenerated, to make your change permanently, include it in the static section.
# section: static << START{unPackedStaticPart}# section: static << END

# section: dynamic << START
{redirect_string_from_dict(addMovedRedirects(mapping, finalDict))}
{unPackedDynamicPart}
# section: dynamic << END"""

	f = open("netlify.toml", "w")
	f.write(outputRedirectsFile)
	f.close()
	# print(unPackedDocument)