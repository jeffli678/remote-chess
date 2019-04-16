# encoding: utf-8
import subprocess
import threading
import os
import sys
import re
import time
import json
import collections
from config_parser import config
import web_server 
import frp_ctrl 

def quit_watch_dog(quit_char = 'q'):

	print('press %s to quit...' % quit_char)
	while True:
		try:
			c = raw_input('')
		except Exception as e:
			return

		if c == quit_char:
			print('quit...')
			os._exit(0)

def main():
	
	server_thread = threading.Thread(target = web_server.start_server, \
			args = [config['listen_interface'], config['listen_port']])
	server_thread.start()

	# if you wish to visit this from the public web, you should enable this
	# Do not forget to change the frp_remote_port in config.json
	# You MUST at least find a unique frp_remote_port!! 

	if config['frp_reverse_proxy']:
		frpc_thread = threading.Thread(target = frp_ctrl.start_frpc)
		frpc_thread.start()
	print('for public access, please visit http://%s:%s' % \
				(config['frp_server'], config['frp_remote_port']))

	quit_watch_dog()

if __name__ == '__main__':
	main()

