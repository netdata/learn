# Imports
import itertools
import pathlib
import shutil
import os
import sys
import argparse
import git
import glob
import re

dry_run = False

filesDictionary = {}
markdownFiles = []
docsPrefix = "../docs/"


# Will come back to this once we have a concrete picture of the script
# if sys.argv[1] == "dry-run":
#     print("--- DRY RUN ---\n")
#     dry_run = True


def renameReadmes(markdownFiles):
    """
    In this function we will get the whole list of files,
    search for README named files, and rename them in accordance to their parent dir name.
    After we rename, we need to update the list entry.
    """

    counter = 0
    for filename in markdownFiles:
        if filename.__contains__("README"):
            # Get the path without the filename
            filename = pathlib.Path(filename)
            # And then from that take the last dir, which is the name we want to rename to, add a needed "/" and the
            # ".md"
            newPath = os.path.dirname(filename) + "/" + os.path.basename(filename.parent.__str__()[1:]) + ".md"

            os.rename(filename, newPath)
            markdownFiles[counter] = newPath
        counter += 1


def changePath(oldFilePath, newFilePath):
    """REQUIRES:
    In the oldFilePath the metadata:
    nature: e.g Concepts
    path: e.g /agent/ <- the folder inside the Concepts directory
    """

    # Get the path
    newDir = os.path.dirname(newFilePath)

    # If the new dir doesn't exist, create it
    if not os.path.exists(newDir):
        os.makedirs(newDir)
    # Then remove the file
    shutil.move(oldFilePath, newFilePath)

    # Update the dict of the file's metadata
    filesDictionary.get(oldFilePath).update({"newLearnPath": newFilePath})


def cloneRepoD1(owner, repo, branch):
    try:
        outputFolder = repo.lstrip(".")
        # print("DEBUG", outputFolder)
        git.Git().clone("https://github.com/{}/{}.git".format(owner, repo), "." + outputFolder, depth=1, branch=branch)
        return ("Cloned the {} branch from {} repo".format(branch, repo))
    except Exception as e:
        return ("Couldn't clone t the {} branch from {} repo".format(branch, repo))


def fetchMarkdownFromRepo(outputFolder):
    return (glob.glob(outputFolder + '/**/*.md*', recursive=True))


def readMetadataFromDocs(pathToPath):
    """
    Identify the area with pattern " <!-- ...multiline string -->" and  converts them
    to a dictionary of key:value pairs
    """
    metdataDictionary = {}
    with open(pathToPath, "r+") as fd:
        rawText = "".join(fd.readlines())
        pattern = r"(<!--\n)((.|\n)*)(\n-->)"
        matchGroup = re.search(pattern, rawText)
        if (matchGroup):
            rawMetadata = matchGroup[2]
            listMetadata = rawMetadata.split("\n")
            while listMetadata:
                line = listMetadata.pop(0)
                splitedInKeywords = line.split(": ")
                key = splitedInKeywords[0]
                value = splitedInKeywords[1]
                # If it's a multiline string
                while (listMetadata and len(listMetadata[0].split(": ")) <= 1):
                    line = listMetadata.pop(0)
                    value = value + line.lstrip(' ')

                metdataDictionary[key] = value.lstrip('>-')
    return ({'{0}'.format(pathToPath): metdataDictionary})


def sanitizePage(path):
    # Open the file for reading
    file = open(path, "r")
    body = file.read()
    file.close()

    # Replace the metdata with comments
    body = body.replace("<!--", "---")
    body = body.replace("-->", "---")

    # The list with the lines that will be written in the file
    output = []

    # For each line of the file I read
    for line in body.splitlines():
        # If the line isn't a H1 title, and it isn't an analytics pixel, append it to the output list
        if not line.startswith("# ") and not line.startswith("[![analytics]"):
            output.append(line + "\n")

    # TODO remove github badges

    # Open the file for overwriting, we are going to write the output list in the file
    file = open(path, "w")
    file.seek(0)
    file.writelines(output)


def fixMovedLinks(path, dict):
    # Open the file for reading
    file = open(path, "r")
    body = file.read()
    file.close()
    output = []

    # For every line in the file we are going to search for urls,
    # and check the dictionary for the relative path of Learn.
    for line in body.splitlines():
        if re.search("\]\((.*?)\)", line):
            # Find all the links inside that line
            urls = re.findall("\]\((.*?)\)", line)

            for url in urls:
                replaceString = url
                # If the URL is a GitHub one
                if not (url.startswith("#") or url.startswith("http") or url.startswith("https://learn.netdata.cloud")):
                    # The URLs we care about are the ones that are relative to their repo, so we add a dot to make
                    # them match the keys inside the dictionary
                    key = "." + url

                    # If it is indeed a key inside the dictionary
                    if key in dict.keys():
                        metadata = dict.get(key)
                        replaceString = metadata.get("newLearnPath").split("..")[1]
                # Remove the .md
                line = line.replace(url, replaceString.split('.md')[0])
        output.append(line + "\n")

    file = open(path, "w")
    file.seek(0)
    file.writelines(output)
    file.close()


def cleanupRepos():
    shutil.rmtree(".github")
    shutil.rmtree(".netdata")
    shutil.rmtree(".go.d.plugin")


if __name__ == '__main__':
    "Dummy run, cloning 3 repos and check all the markdowns they have"
    print(cloneRepoD1("netdata", "go.d.plugin", "master"))
    print(cloneRepoD1("netdata", "netdata", "master"))
    print(cloneRepoD1("netdata", ".github", "main"))

    # We fetch the markdown files from the repositories
    markdownFiles = list(itertools.chain(fetchMarkdownFromRepo(".netdata"),
                                         fetchMarkdownFromRepo(".go.d.plugin"),
                                         fetchMarkdownFromRepo(".github")))

    print("Files detected: ", len(markdownFiles))

    # # Test case for some dummy files
    markdownFiles.append("./new/a.md")
    markdownFiles.append("./new/b.md")

    # PRIOR TO MOVING

    print("Gathering Learn files...")
    # After this we need to keep only the files that have metadata, so we will fetch metadata for everything and keep
    # the entries that have populated dictionaries
    learnMarkdownFiles = []
    for md in markdownFiles:
        response = readMetadataFromDocs(md)
        # Check to see if the dictionary returned is empty
        if response.get(md):
            learnMarkdownFiles.append(md)

    # TODO hidden osa den exoun metadata me tin domi tou repo pou irthan

    # we update the list only with the files that are destined for Learn
    markdownFiles = learnMarkdownFiles
    print("  Found Learn files: ", len(markdownFiles))
    print("  Renaming README.md files...")
    renameReadmes(markdownFiles)

    print("Done.")

    # METADATA

    print("Reading the metadata for each file...")

    # Read the Metadata
    for md in markdownFiles:
        filesDictionary.update(readMetadataFromDocs(md))

    print("Done.")

    # FILE MOVING

    print("Moving files...")

    # TODO the dict needs to be filename -> oldpath newpath metadata

    # Then we need to sanitize the page and move it to the correct path, if it doesn't have a path for now we continue
    # on, so it doesn't get moved anywhere
    for md in filesDictionary:
        sanitizePage(md)
        # If I have the metadata needed ot build a path, move the file to the correct destination
        if "path" in filesDictionary.get(md).keys() and "nature" in filesDictionary.get(md).keys():
            changePath(md,
                       docsPrefix +
                       filesDictionary.get(md).get("nature") +
                       filesDictionary.get(md).get("path") +
                       os.path.basename(md))

    print("Done")

    # FIX LINKS

    print("Fixing github links...")

    # After the moving, we have a new metadata, called newLearnPath, and we utilize that to fix links that were
    # pointing to GitHub relative paths
    for md in filesDictionary:
        if "newLearnPath" in filesDictionary.get(md).keys():
            fixMovedLinks(filesDictionary.get(md)["newLearnPath"], filesDictionary)

    print("Done.")

    print("Cleaning up the repos...")
    cleanupRepos()
    print("Done.")
