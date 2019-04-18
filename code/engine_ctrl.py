# encoding: utf-8
import os
import subprocess
import threading
from log_util import log
import config_parser 
import board_logic 
import web_server 

class Engine:

    def __init__(self):

        base_dir = os.path.dirname(__file__)
        engine_dir = os.path.abspath(os.path.join(base_dir, os.pardir, 'engine'))
        engine_exe = config_parser.config['engine_exe']
        engine_path = os.path.join(engine_dir, engine_exe)
        self.proc = subprocess.Popen(engine_path, cwd = engine_dir, shell = True, stdin = subprocess.PIPE, \
                stderr = subprocess.STDOUT, stdout = subprocess.PIPE, universal_newlines = True)
        self.write_input('ucci')
        self.idle_timer = None
        self.engine_user = None
        log('init engine')

        self.output_thread = threading.Thread(target = self.format_ponder)
        self.output_thread.start()

    def write_input(self, str):
        self.proc.stdin.write(str + '\n')

    def command_output(self):
        line = ''
        while self.proc.poll() == None:

            char = self.proc.stdout.read(1)
            if char == '\n':
                yield line
                line = ''
                continue
            else:
                line += char
    
    def stop(self):
        log('stop')
        self.write_input('stop')
        web_server.broadcast_msg('stop')
    
    def ponder_fen(self, fen = '', stop_engine = True):
        
        if not fen:
            fen = board_logic.board.get_fen()
            
        if board_logic.board.is_valid_fen(fen):
            board_logic.board.set_fen(fen)
            board_logic.board.last_made_move = ''

            if stop_engine:
                self.stop()

            self.set_idle_timer()

            self.write_input('position fen %s' % fen)
            self.write_input('go ponder')
            log('ponder fen: %s' % fen)
            return True

        else:
            return False

    def set_idle_timer(self, seconds = 15 * 60):
        try:
            self.idle_timer.cancel()
        except:
            pass
        
        self.idle_timer = threading.Timer(seconds, self.stop)
        self.idle_timer.start()
        log('idle_timer set')

    def format_ponder(self):

        for line in self.command_output():

            if not line.startswith('info '): 
                continue

            output_str = board_logic.board.format_engine_line_info(line)
            if output_str:
                # because sending the message over the network is slow
                # queue the message and send them one by one
                web_server.queue_msg(output_str)
                # web_server.broadcast_msg(output_str)

    def check_user(self, ws, message):
        
        if message == "passwd " + config_parser.config['auth_passwd']:
            self.engine_user = ws
            return 'verify ok'

        elif ws == self.engine_user:
            return 'already verified'
        
        else:
            return 'verify fail'

    def make_move(self, move = ''):

        engine.stop()
        board_logic.board.make_move(move)
        self.ponder_fen(board_logic.board.fen, stop_engine = False)

engine = Engine()