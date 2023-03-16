import json

def generate_api_doc(TEMP_FOLDER):
    with open(f'{TEMP_FOLDER}/netdata/web/api/netdata-swagger.json', 'r') as file:
        configuration = json.load(file)

    with open('api.json', 'w') as json_file:
        json.dump(configuration, json_file)

    # output = json.dumps(json.load(open('config.json')), indent=2)
    # print(output)