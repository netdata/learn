# Imports
import re


def removeEditLinks(file_path):
    # Open the file for reading
    dummyFile = open(file_path, "r")
    body = dummyFile.read()
    dummyFile.close()
    output = []

    for line in body.splitlines():
        if re.search("custom_edit_url: https:\/\/github.com\/", line):
            line = line.replace(line, "custom_edit_url: null")

        output.append(line + "\n")

    # Write everything onto the file again
    dummyFile = open(file_path, "w")
    dummyFile.seek(0)
    dummyFile.writelines(output)
    dummyFile.close()
