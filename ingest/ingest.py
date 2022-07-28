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

dryRun = False

filesDictionary = {}
markdownFiles = []
docsPrefix = "../docs/"
TEMP_FOLDER = "ingest-temp-folder"
defaultRepos = {
    "netdata":
        {
            "owner": "netdata",
            "branch": "master",
        },
    "go.d.plugin":
        {
            "owner": "netdata",
            "branch": "master",
        },
    ".github":
        {
            "owner": "netdata",
            "branch": "main",
        },
    "agent-service-discovery":
        {
            "owner": "netdata",
            "branch": "master",
        }
     }

#defaultRepoInaStr = " ".join(defaultRepo)
#print(defaultRepoInaStr)

# Will come back to this once we have a concrete picture of the script
# if sys.argv[1] == "dry-run":
#     print("--- DRY RUN ---\n")
#     dry_run = True

def unSafecleanUpFolders(folderToDelete):
    print("Try to clean up the folder: ", folderToDelete)
    try:
        shutil.rmtree(folderToDelete)
        print("Done")
    except Exception as e:
        print("Couldn't delete the folder due to the exception: \n", e)



def safecleanUpFolders():
    pass

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


def cloneRepo(owner, repo, branch, depth, prefixFolder):
    try:
        outputFolder = prefixFolder + repo
        # print("DEBUG", outputFolder)
        git.Git().clone("https://github.com/{}/{}.git".format(owner, repo), outputFolder, depth=depth, branch=branch)
        return ("Cloned the {} branch from {} repo (owner: {})".format(branch, repo, owner))
    except Exception as e:
        return ("Couldn't clone the {} branch from {} repo (owner: {}) \n Exception {} raised".format(branch, repo, owner, e))


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



if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Ingest docs from multiple repositories')

    parser.add_argument(
        '--repos',
        default=[],
        nargs='+',
        help='Choose specific repo you want ingest, if not set, defaults ingested'
    )

    parser.add_argument(
        "-d", "--dry-run",
        help="Don't save a file with the output.",
        action="store_true",
    )
    # netdata/netdata:branch tkatsoulas/go.d.plugin:mybranch
    kArgs = parser.parse_args()._get_kwargs()
    for x in kArgs:
        if x[0] == "repos":
            listOfReposInStr = x[1]
        if x[0] == "dryRun":
            print(x[1])
            dryRun = x[1]

    if len(listOfReposInStr)>0:
        for repoStr in listOfReposInStr:
            try:
                _temp = repoStr.split("/")
                owner, repo, branch = [_temp[0]] + (_temp[1].split(":"))
                defaultRepos[repo]["owner"] = owner
                defaultRepos[repo]["branch"] = branch
            except(TypeError,ValueError):
                print("You specified a wrong format in at least one of the repos you want to ingest")
                parser.print_usage()
                exit(-1)
            except(KeyError):
                print("The repo you specified in not in predefined repos")
                print(defaultRepos.keys())
                parser.print_usage()
                exit(-1)
            except:
                print("Unknown error in parsing")


    '''
    Clean up old clones into a temp dir
    '''
    unSafecleanUpFolders(TEMP_FOLDER)

    print("Creating a temp directory \"temp_clones\"")
    try:
        os.mkdir(TEMP_FOLDER)
    except(FileExistsError):
        print("Folder already exists")

    '''Clone all the predefined repos'''
    for key in defaultRepos.keys():
        print(cloneRepo(defaultRepos[key]["owner"], key, defaultRepos[key]["branch"], 1, TEMP_FOLDER+"/"))
    # We fetch the markdown files from the repositories
    markdownFiles = list(itertools.chain(fetchMarkdownFromRepo(TEMP_FOLDER+"/netdata"),
                                         fetchMarkdownFromRepo(TEMP_FOLDER+"/go.d.plugin"),
                                         fetchMarkdownFromRepo(TEMP_FOLDER+"/github")))

    print("Files detected: ", len(markdownFiles))
    '''
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
    '''
