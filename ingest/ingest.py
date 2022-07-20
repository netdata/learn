#Imports
import shutil
import os
import sys
import argparse
import git
import glob
import re

dry_run = False
allMarkdownFiles = []

# Will come back to this once we have a concrete picture of the script
if sys.argv[1] == "dry-run":
    print("--- DRY RUN ---\n")
    dry_run = True


def changePath(oldFilePath, newFilePath):
    # Get the path
    newDir = os.path.dirname(newFilePath)

    # If the new dir doesn't exist, create it
    if not os.path.exists(newDir):
        os.mkdir(newDir)
    # Then remove the file
    shutil.move(oldFilePath, newFilePath)

    # Return the tuple
    return (oldFilePath, newFilePath)

def cloneRepoD1(owner, repo, branch):
    try:
        git.Git().clone("https://github.com/{}/{}.git".format(owner, repo), repo, depth=1, branch=branch)
        return("Cloned the {} branch from {} repo".format(branch, repo))
    except:
        return ("Couldn't clone t the {} branch from {} repo".format(branch, repo))

def fetchMarkdownFromRepo(outputFolder):
    return(glob.glob(outputFolder+'/**/*.md*', recursive=True))

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
                while(listMetadata and len(listMetadata[0].split(": "))<=1):
                    line = listMetadata.pop(0)
                    value = value+line.lstrip(' ')

                metdataDictionary[key] = value.lstrip('>-')
    return(metdataDictionary)

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

    # print(output)

    # Open the file for overwriting, we are going to write the output list in the file
    file = open(path, "w")
    file.seek(0)
    file.writelines(output)


def normalizeLinks(path):
    # Open the file for reading
    file = open(path, "r")
    body = file.read()
    file.close()

    # The list with the lines that will be written in the file
    output = []

    # For each line of the file I read
    for line in body.splitlines():
        # Use a regex to see if the line has in it a link
        if re.search("\]\((.*?)\)", line):
            # Find all the links inside that line
            urls = re.findall("\]\((.*?)\)", line)

            # The string that will replace the URL
            replaceString = ""

            # For every URL we find, check if it has a certain pattern
            for url in urls:
                # If it is a learn URL, strip the first portion of it
                if url.startswith("https://learn.netdata.cloud/"):
                    replaceString = url.split("https://learn.netdata.cloud/")[1]
                # If it is an anchor link, an external link or a mailto, leave it as is
                elif url.startswith("#") or url.startswith("http") or url.startswith("mailto"):
                    replaceString = url

                # TODO Joel had some static locations that he wasn't touching, this needs some more work for those links
                # and mainly we need to figure out what we are going to do with our structure

                # elif url.startswith("/docs/"):
                #     replaceString = url

                # Not sure about these, Joel's concept
                # // If the link is to a guide page in the `/docs/guides` folder.
                #       if (url.includes('guides/')) {
                #         url = url.split('guides/')[1]
                #         const guideUrl =  path.join(guideDir, url)
                #         return `](${guideUrl})`
                #       }
                #
                #       // If the link is to a step-by-step guide page in the `/docs/step-by-step`
                #       // folder.
                #       if (url.includes('step-by-step/') || url.includes('step-')) {
                #         if (url.includes('step-by-step/')) {
                #           url = url.split('step-by-step/')[1]
                #         }
                #         const guideUrl =  path.join(guideDir, 'step-by-step', url)
                #         return `](${guideUrl})`
                #       }
                #
                #       // If the link is to one of a few contributing-related documents.
                #       if (url.includes('contributing-documentation')) {
                #         const contribUrl =  path.join(contribDir, 'documentation')
                #         return `](${contribUrl})`
                #       } else if (url.includes('style-guide')) {
                #         const contribUrl =  path.join(contribDir, 'style-guide')
                #         return `](${contribUrl})`
                #       } else if (url.includes('code_of_conduct')) {
                #         const contribUrl =  path.join(contribDir, 'code-of-conduct')
                #         return `](${contribUrl})`
                #       } else if (url.includes('contributing.md')) {
                #         const contribUrl =  path.join(contribDir, 'handbook')
                #         return `](${contribUrl})`
                #       } else if (url.includes('contributors.md')) {
                #         const contribUrl =  path.join(contribDir, 'license')
                #         return `](${contribUrl})`
                #       }
                #
                #
                #       // If the link is already absolute-relative. If it begins with `/docs`,
                #       // cut that. Return the normalized link.
                #       if (url.startsWith('/')) {
                #         if (url.startsWith('/docs')) {
                #           url = url.replace('/docs', '')
                #         }
                #         const absRelUrl = path.join(agentDir, url)
                #         return `](${absRelUrl})`
                #       }
                #
                #       // Catch for anything else. Return the normalized link.
                #       const normalizedUrl = path.join('/', agentDir, '/', tokens.dir, url).toLowerCase()
                #       return `](${normalizedUrl})`
                #     })

                # Re-build the line with the correct links
                line = line.replace(url, replaceString)
                # print(line)

        output.append(line + "\n")

    # print(output)

    # Open the file for overwriting, we are going to write the output list in the file
    file = open(path, "w")
    file.seek(0)
    file.writelines(output)
    file.close()


def fixMovedLinks(path, dict):
    # the path is the page I am going to check
    # dict -> (oldPath, newPath)

    # Open the file for reading
    file = open(path, "r")
    body = file.read()
    file.close()
    output = []

    # For every key in the dictionary
    for tuple in dict:

        # print(tuple[0], tuple[1])
        # Check every line of the file
        for line in body.splitlines():
            # If the line contains the `key` in a link, replace it with it's `value` (replace the old path with the
            # new one)
            if line.__contains__(tuple[0].split(".md")[0]):
                line = line.replace(tuple[0].split(".md")[0], tuple[1].split(".md")[0])
            output.append(line + "\n")
            # print(line)

    # Open the file for overwriting, we are going to write the output list in the file
    file = open(path, "w")
    file.seek(0)
    file.writelines(output)
    file.close()



if __name__ == '__main__':
    "Dummy run, cloning 3 repos and check all the markdowns they have"
    print(cloneRepoD1("netdata", "go.d.plugin", "master"))
    print(cloneRepoD1("netdata", "netdata", "master"))
    print(cloneRepoD1("netdata", ".github", "main"))
    fetchMarkdownFromRepo("netdata")
    allMarkdownFiles = list(itertools.chain(fetchMarkdownFromRepo("netdata"),
                                            fetchMarkdownFromRepo("go.d.plugin"),
                                            fetchMarkdownFromRepo(".github")))

# TODO see the .../.md links, what we should do with them.

# CHANGE PATH TEST
# diction = []
# diction.append(changePath("./new/samplename.md", "./testfolder/samplename.md"))

# SANITIZE TEST
# sanitizePage("./new/samplename.md")

# NORMALIZE LINKS TEST
# normalizeLinks("./new/samplename.md")

# FIX MOVED LINKS TEST
# dict = [("/docs/new/sample.md","/docs/new/samplename.md")]
# fixMovedLinks("./new/samplename.md", dict)

# Prior to running the tests, copy the original md, so you can keep the old format of
# it so you can run the tests again and again.

""" TODO
are the tuples going to be the full filepath? Like .../../sample.md
or
are they going to be without the extension?

The above assumes the paths have the .md in them

Also, note that when we piece this together the signatures of these functions might need to change, or a function 
might be needed to loop for all the files in the dict, instead of taking only one file as an argument.
"""
