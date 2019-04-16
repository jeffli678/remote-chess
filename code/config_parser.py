# encoding: utf-8
import json
import os

def load_config():

	public_config_path = 'config.json'
	if os.path.exists(public_config_path):
		config_path = public_config_path
	else:
		config_path = 'config-private.json'

	print('using config file at: %s' % config_path)
	
	with open(config_path) as json_data_file:
		config = json.load(json_data_file)

	return config
    
config = load_config()