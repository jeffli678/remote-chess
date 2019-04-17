import os
import subprocess
from config_parser import config

def update_frpc_ini(frpc_ini_path):

    f = open(frpc_ini_path, 'r').read().splitlines()
    output = open(frpc_ini_path, 'w')

    for line in f:
        if line.startswith('local_port'):
            line = 'local_port = %d' % config['listen_port']
        
        if line.startswith('remote_port'):
            line = 'remote_port = %d' % config['frp_remote_port']
            
        elif line.startswith('server_addr'):
            line = 'server_addr = %s' % config['frp_server']
        
        elif line.startswith('server_port'):
            line = 'server_port = %d' % config['frp_auth_port']

        elif line.startswith('privilege_token'):
            line = 'privilege_token = %s' % config['frp_token']
        
        output.write(line + '\n')

    output.close()

def start_frpc():

    base_dir = os.path.dirname(__file__)
    frpc_dir = os.path.abspath(os.path.join(base_dir, os.pardir, 'frpc'))
    frpc_path = os.path.join(frpc_dir, 'frpc.exe')
    frpc_ini_path = os.path.join(frpc_dir, 'frpc.ini')

    update_frpc_ini(frpc_ini_path)

    _ = subprocess.Popen('%s -c %s' % (frpc_path, frpc_ini_path), cwd = frpc_dir)
    logging.info('frpc started')