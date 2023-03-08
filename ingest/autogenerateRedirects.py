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
        outputDictionary[inputMatrix[x]["metadata"]["custom_edit_url"]] = inputMatrix[x]["newLearnPath"]
        outputDictionary[inputMatrix[x]["metadata"]["custom_edit_url"].replace("/edit/","/blob/")] = inputMatrix[x]["newLearnPath"]
    return (outputDictionary)


def readRawStaticRedirectsFromFile(pathToFile):
	"""
	This function reads the netlify.toml file, identifies
	the static section between # section: static START|END
	and saves them into a multiline string.
	"""
	redirects = ""
	section_pattern = re.compile(r'#\s*section:\s*static\s*<<\s*START(.+?)#\s*section:\s*static\s*<<\s*END', re.DOTALL)
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
	section_pattern = re.compile(r'#\s*section:\s*dynamic\s*<<\s*START(.+?)#\s*section:\s*dynamic\s*<<\s*END', re.DOTALL)
	redirects_pattern = re.compile(r'\[\[redirects\]\]\s+from\s*=\s*"(.+?)"\s+to\s*=\s*"(.+?)"')
	with open(pathToFile, "r+") as fd:
		document_text = "".join(fd.readlines())
		sections = section_pattern.findall(document_text)
		for section in sections:
			redirectsList = redirects_pattern.findall(section)
		
		for k,v in redirectsList.__iter__():
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
		return({key.replace("https://learn.netdata.cloud",""): value for key, value in json.load(json_file).items()})
	

def UpdateGHLinksBasedOnMap(mapMatrix, inputDictionary):
	for k,v in inputDictionary.items():
		if v in mapMatrix.keys():
			inputDictionary[k] = mapMatrix[v]
		else:
			pass
	return (inputDictionary)


def addDirRedirects(mapping, finalDict):
	print()
	mapDict = pd.read_csv("map.tsv", sep='\t').set_index(
		'custom_edit_url').T.to_dict('dict')
	one_commit_back = pd.read_csv(
		"./ingest/one_commit_back.tsv", sep='\t').set_index('custom_edit_url').T.to_dict('dict')
	redirects = {}
	key = ""
	value = ""

	for custom_edit_url in mapDict.keys():
		SAME_SIDEBARS = mapDict[custom_edit_url]["sidebar_label"] == one_commit_back[custom_edit_url]["sidebar_label"]
		SAME_LEARN_REL_PATHS = mapDict[custom_edit_url]["learn_rel_path"] == one_commit_back[custom_edit_url]["learn_rel_path"]
		NOT_NAN_SIDEBARS = str(mapDict[custom_edit_url]["sidebar_label"]) != "nan" and str(
			one_commit_back[custom_edit_url]["sidebar_label"]) != "nan"
		NOT_NAN_LEARN_REL_PATHS = str(mapDict[custom_edit_url]["learn_rel_path"]) != "nan" and str(
			one_commit_back[custom_edit_url]["learn_rel_path"]) != "nan"
		OLD_LEARN_PATH_NOT_IN_NEW = str(one_commit_back[custom_edit_url]["learn_rel_path"]).split("/") not in  str(mapDict[custom_edit_url]["learn_rel_path"]).split("/") 

		# if not SAME_SIDEBARS and NOT_NAN_SIDEBARS:
		# 	# print(mapDict[custom_edit_url]["sidebar_label"],"|",one_commit_back[custom_edit_url]["sidebar_label"])
		# 	old = one_commit_back[custom_edit_url]["sidebar_label"].lower().replace(" ", "-").replace("//", "/")
		# 	new = mapDict[custom_edit_url]["sidebar_label"].lower().replace(" ", "-").replace("//", "/")
		old = str(one_commit_back[custom_edit_url]["learn_rel_path"]).lower().replace(
			" ", "-").replace("//", "/")
		new = str(mapDict[custom_edit_url]["learn_rel_path"]).lower().replace(
			" ", "-").replace("//", "/")

		
		if not SAME_LEARN_REL_PATHS and NOT_NAN_LEARN_REL_PATHS and OLD_LEARN_PATH_NOT_IN_NEW and (old != new):
			print("The to", mapDict[custom_edit_url]["learn_rel_path"] , "the old from" , one_commit_back[custom_edit_url]["learn_rel_path"])

			print(old, " -> ", new)

			fromURL = mapping[custom_edit_url]
			toURL = mapping[custom_edit_url]

			# print("FROMURL" , fromURL, "TOURL", toURL)
			print(len(old.split("/")))
			print(len(new.split("/")))
			
			old_key_array = old.split("/")[::-1]
			new_key_array =new.split("/")[::-1]

			new_key_array

			for i in range(min(len(old_key_array), len(new_key_array))):
				oldKey = old_key_array.pop(0)
				newKey = new_key_array.pop(0)

				if len(old_key_array) == 0:
					new_key_array[::-1]
					output=""
					for string in new_key_array:
						# newKey += "/" + string
						output+= string + "/"
					newKey = output + newKey

					print("OLD KEY ARRAY IS EMPTY, probably files got moved from B/C to A")
					print("Replacing", newKey, " with ", oldKey, "on", fromURL)
					fromURL = fromURL.replace(newKey, oldKey)
					break
				elif len(new_key_array) == 0:
					old_key_array[::-1]
					output =""
					for string in old_key_array:
						# oldKey += "/" + string
						output +=  string + "/" 
					oldKey = output + oldKey

					print("NEW KEY ARRAY IS EMPTY, probably files got moved from A to B/C")
					print("Replacing", newKey, " with ", oldKey, "on", fromURL)
					fromURL = fromURL.replace(newKey, oldKey)
					break
				
				# print("comparing", oldKey, "with", newKey, "\n", oldKey != newKey)
				elif oldKey != newKey:
					# POSSIBLE BUG IF I ONLY WANT TO RE-ROUTE ONLY THE PARENT FOLDER
					print("Replacing", newKey, " with ", oldKey, "on", fromURL)
					fromURL = fromURL.replace(newKey+"/", oldKey+"/")
					# need to check for tail entries being the same
			reverseFromPath = fromURL.split("/")[::-1]
			reverseToPath = toURL.split("/")[::-1]

			print("Before fromurl", fromURL, "before tourl", toURL)

			for fromPath, toPath in zip(reverseFromPath, reverseToPath):
				print("Comparison:", fromPath, toPath, fromPath == toPath)
				if fromPath == toPath:
					fromURL = fromURL.replace(fromPath, "", 1)
					toURL = toURL.replace(toPath, "", 1)
					print("after comparison", fromURL, "aftercomparison", toURL)
				else:
					break

		# TODO HERE IS THE SPOT FOR THE UPDATE IN THE DICT
			fromURL = fromURL.replace("//", "/")
			toURL = toURL.replace("//", "/")

			if not fromURL.endswith("/"):
				fromURL += "/"

			if not toURL.endswith("/"):
				toURL += "/"

			print("FROM", fromURL, "TO", toURL, "\n")
			if fromURL not in finalDict and not all(ch in "/" for ch in fromURL) and not all(ch in "/" for ch in toURL):
				redirects.update({fromURL: toURL})

	print(redirects)

	return redirects
	

def redirect_string_from_dict(dictionary):
	output_string = ""

	for key in dictionary:
		output_string += f"\n[[redirects]]\n  from=\"{key}\"\n  to=\"{dictionary[key]}\"\n"


	print(output_string)

	return output_string


def main(GHLinksCorrelation):
	

	mapping = reductTonewLearnPathFromGHLinksCorrelation(GHLinksCorrelation)
	#print(GHLinksCorrelation)
	oldLearn = readLegacyLearnDocMap("LegacyLearnCorrelateLinksWithGHURLs.json")
	#print(oldLearn)
	oldLearn_redirects = UpdateGHLinksBasedOnMap(mapping, oldLearn)
	# print(mapping)

	#print(oldLearn)
	try:
		finalDict = combineDictsOverwrite(readRedirectsFromFile("netlify.toml"), oldLearn_redirects)
		# print(finalDict)
	except Exception as e:
		print(f"An exception occurred: {e}")
	unPackedDynamicPart = ''
	for key, value in finalDict.items():
		if not value.startswith("https://"):
			unPackedDynamicPart+= redirectUnit(key, value)
	#print(unPackedDocument)
	#print(readRawStaticRedirectsFromFile("netlify.toml"))
	print("Links from the legacy learn that are not matched:")
	for key, value in finalDict.items():
		if value.startswith("https://"):
			print(key, value)
	unPackedStaticPart= readRawStaticRedirectsFromFile("netlify.toml")
	outputRedirectsFile = f"""# This document is autogenerated, to make your change permanently, include it in the static section.
# section: static << START{unPackedStaticPart}# section: static << END

# section: dynamic << START
{redirect_string_from_dict(addDirRedirects(mapping, finalDict))}
{unPackedDynamicPart}
# section: dynamic << END"""

	
	

	f = open("netlify.toml", "w")
	f.write(outputRedirectsFile)
	f.close()
	#print(unPackedDocument)
	