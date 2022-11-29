# Imports
import re


def santizeEditLinks(file_path):
    '''
    Takes as argument a md(x) file of learn
    and changes it's custom_edit_url to null
    WA: sed -i 's/^custom_edit_url:.*$/custom_edit_url: null/' <FILE_NAME>
    '''
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
