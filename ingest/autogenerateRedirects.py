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

def combineDicts(dict1, dict2):
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
		print(sections)
		for section in sections:
			print(section)
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
	

def UpdateGHLinksBasedOnMap(mapDF, input_dictionary):
	pass
#def main():
try:
	new_dict = combineDicts(readRedirectsFromFile("../netlify.toml"), readLegacyLearnDocMap("../LegacyLearnCorrelateLinksWithGHURLs.json"))
	print(new_dict)
except Exception as e:
	print(f"An exception occurred: {e}")

			
