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
			


		# print(old_mapping[custom_edit_url])
		# # boolean flags
		# NOT_NAN_LEARN_REL_PATHS = str(map_dict[custom_edit_url]["learn_rel_path"]) != "nan" \
        #             and str(one_commit_back[custom_edit_url]["learn_rel_path"]) != "nan"

		# OLD_LEARN_PATH_NOT_IN_NEW = str(one_commit_back[custom_edit_url]["learn_rel_path"]).split("/") \
		# 	not in str(map_dict[custom_edit_url]["learn_rel_path"]).split("/")

		# # Get the new and old learn_rel_path of the custom_edit_url
		# old = str(one_commit_back[custom_edit_url]["learn_rel_path"]).lower().replace(
		# 	" ", "-").replace("//", "/")
		# new = str(map_dict[custom_edit_url]["learn_rel_path"]).lower().replace(
		# 	" ", "-").replace("//", "/")

		# # If old and new is different, both are not nan, and this is not a renaming scheme like: A -> A/B (can't make a dir redirect, as there might be other files inside A)
		# if NOT_NAN_LEARN_REL_PATHS and OLD_LEARN_PATH_NOT_IN_NEW and (old != new):
		# 	# print("The to", map_dict[custom_edit_url]["learn_rel_path"],
		# 	#       "the old from", one_commit_back[custom_edit_url]["learn_rel_path"])
		# 	print(old, " -> ", new)

		# 	old_key_array = old.split("/")[::-1]
		# 	new_key_array = new.split("/")[::-1]

		# 	CHILDSAME = False
		# 	ignore_last = 0

		# 	for i in range(min(len(old_key_array), len(new_key_array))):
		# 		oldKey = old_key_array[i]
		# 		newKey = new_key_array[i]
		# 		if oldKey == newKey and not CHILDSAME:
		# 			CHILDSAME = True
		# 		elif oldKey == newKey and CHILDSAME:
		# 			ignore_last += 1
		# 			CHILDSAME = True
		# 		elif oldKey != newKey:
		# 			break
		# 	print("After first loop\n",old, " -> ", new, ignore_last)

		# 	print("RANGE", range(0,len(old_key_array)-ignore_last))
		# 	old_key_array = old_key_array[::-1]
		# 	output = ""
		# 	for i in range(0,len(old_key_array)-ignore_last):
		# 		output += old_key_array[i] + "/"
		# 	old = "/docs/" + output + "*"

		# 	new_key_array = new_key_array[::-1]
		# 	output = ""
		# 	for i in range(0,len(new_key_array)-ignore_last):
		# 		output += new_key_array[i] + "/"
			
		# 	new = "/docs/" + output + ":splat"

		# 	print("After ignore\n",old, " -> ", new, "\n\n")

			# # Get the proper URL for "from" and "to"
			
			# # from_url = mapping[custom_edit_url]
			# built_destination_check_string = ""

			# test_from_url=""
			# dest_url = mapping[custom_edit_url]

			# print("TESTFROMURL" , test_from_url, "DESTURL", dest_url)
			# # print(len(old.split("/")))
			# # print(len(new.split("/")))

			# # Make two reverse arrays, that contain the paths splitted by "/", in reverse so we can inspect what changed in a backwards fashion
			# old_key_array = old.split("/")[::-1]
			# new_key_array = new.split("/")[::-1]

			# # Loop for n times where n  is the smallest length between the two arrays
			# for _ in range(min(len(old_key_array), len(new_key_array))):
			# 	# Pop a pair of elements
			# 	oldKey = old_key_array.pop(0)
			# 	newKey = new_key_array.pop(0)

			# 	# If we have reached the end of the old_key_array, it means that a move has
			# 	# occurred in the fashion of A -> B/C.
			# 	# In this case we want to replace (in from_url) the whole path after the newKey we are in with A
			# 	if len(old_key_array) == 0:
			# 		new_key_array[::-1]
			# 		output = ""
			# 		for string in new_key_array:
			# 			output += string + "/"

			# 		# build the full newKey after our current newKey
			# 		newKey = output + newKey
			# 		built_destination_check_string = newKey + "/" + built_destination_check_string
			# 		print("OLD KEY ARRAY IS EMPTY, probably files got moved from A to B/C")
			# 		print(f"tst is now: {oldKey} + {test_from_url}")
			# 		# print("Replacing", newKey, " with ", oldKey, "on", from_url)
					
			# 		# from_url = from_url.replace(newKey, oldKey)
			# 		test_from_url = oldKey + "/" + test_from_url

			# 		break

			# 	# Else, if we have reached the end of the new_key_array, it means that a move has
			# 	# occurred in the fashion of B/C -> A.
			# 	# In this case we want to replace (in from_url) the whole path after the newKey we are in with B/C
			# 	elif len(new_key_array) == 0:
			# 		old_key_array[::-1]
			# 		output = ""
			# 		for string in old_key_array:
			# 			output += string + "/"

			# 		# build the full oldKey after our current oldKey
			# 		oldKey = output + oldKey
			# 		built_destination_check_string = newKey + "/" + built_destination_check_string
			# 		print("NEW KEY ARRAY IS EMPTY, probably files got moved from B/C to A")
			# 		print(f"tst is now: {oldKey} + {test_from_url}")
			# 		# print("Replacing", newKey, " with ", oldKey, "on", from_url)
					
			# 		# from_url = from_url.replace(newKey, oldKey)
			# 		test_from_url = oldKey +"/"+ test_from_url
			# 		break

			# 	# Else, if the two keys are different, just replace the newKey with the oldKey
			# 	elif oldKey != newKey:
			# 		built_destination_check_string = newKey + "/" + built_destination_check_string
			# 		# print("Replacing", newKey, " with ", oldKey, "on", from_url)
			# 		print(f"tst is now: {oldKey} + {test_from_url}")
			# 		test_from_url = oldKey + "/" + test_from_url
					
			# 		# from_url = from_url.replace(newKey+"/", oldKey+"/")


			# # test_from_url = "/docs/" + test_from_url
			# # print(test_from_url, from_url, dest_url)
			
			# # Now that we have the from_url, we need to check for tail entries being the same,
			# # like both from_url and dest_url ending in "/monitor" in this case,
			# # we should redirect only the parent folder, not the untouched "monitor" folder.
			# # We should only go so far as to the first difference in the URLs, so we reverse the arrays to start from the end
			# # reverseFromPath = from_url.split("/")[::-1]
			# # reverseToPath = dest_url.split("/")[::-1]
			# # reverse_test_from_path = test_from_url.split("/")[::-1]
			# # print(f"Before tstfromurl {test_from_url} before dest {dest_url}")

			# # For every piece of the path, check if they are the same, and if they are, replace only the first occurrence (precaution for /monitor/monitor cases)
			# # Don't worry about extra "/"s as we will deal at the end with that.
			# # for from_path_piece, toPath, test_path in zip(reverseFromPath, reverseToPath, reverse_test_from_path):
			# # 	print("Comparison block")#, from_path_piece, toPath, from_path_piece == toPath)
			# # 	if from_path_piece == toPath:
			# # 		pass
			# # 		# from_url = from_url.replace("/"+ from_path_piece, "", 1)
			# # 		# dest_url = dest_url.replace("/"+ toPath, "", 1)
			# # 		# print("after comparison", from_url, "after comparison", dest_url)
			# # 	else:
			# # 		break
			# dest_url = dest_url.split(new)[0] + new
			
			# test_from_url = "/docs/" + test_from_url

			# # Sanitize from_url and dest_url, remove extra "/"s and just leave one in between dirs, and after add one at the end
			# # final_from_URL = ""
			# # for string in from_url.split("/"):
			# # 	if len(string):
			# # 		final_from_URL += "/" + string
			# # from_url = final_from_URL

			# test = ""
			# for string in test_from_url.split("/"):
			# 	if len(string):
			# 		test += "/" + string
			# test_from_url = test

			# final_to_URL = ""
			# for string in dest_url.split("/"):
			# 	if len(string):
			# 		final_to_URL += "/" + string
			# dest_url = final_to_URL

			# if not from_url.endswith("/"):
			# 	from_url += "/"


			# if not test_from_url.endswith("/"):
			# 	test_from_url += "/"

			# if not dest_url.endswith("/"):
			# 	dest_url += "/"

			# precaution really, not gonna happen after sanitization
			# from_url = from_url.replace("//", "/")
			# test_from_url = test_from_url.replace("//", "/")
			# dest_url = dest_url.replace("//", "/")


			# print(test_from_url, dest_url, built_destination_check_string, "\n")


			# If from_url is not in the finalDict, so there is not a redirect for it already, and the URL is an actual URL,
			# update the dict, so we don't introduce duplicates
			# if old not in finalDict and not all(ch in "/" for ch in old) and not all(ch in "/" for ch in new):
			# 	# print("FROM", from_url, "TO", dest_url, "\n")
			# 	redirects.update({old: new})

	# print(redirects)

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