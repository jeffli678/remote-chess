# encoding: utf-8
import time
import Queue
import threading
from bottle import request, Bottle, abort, static_file

from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

from log_util import log
from engine_ctrl import engine
from board_logic import board

app = Bottle()
clients = set()
msg_queue = Queue.Queue()

def queue_msg(message):
	global msg_queue
	msg_queue.put_nowait(message)

def clear_msg_queue():

	global msg_queue
	while not msg_queue.empty():
		try:
			msg_queue.get(False)
		except Queue.Empty:
			continue
		msg_queue.task_done()

def message_broadcaster():

	global msg_queue
	while True:
		msg = msg_queue.get(block = True)
		broadcast_msg(msg)

def broadcast_msg(message):
	for ws in clients:
		try:
			ws.send(message)
		except:
			pass

def process_msg(ws, message):
	
	check_ret = engine.check_user(ws, message)
	if check_ret == 'verify fail':
		ws.send('You must first be authenticated to use the engine')
		ws.send('auth fail')
		return
	elif check_ret == 'verify ok':
		ws.send('Now you can use the engine')
		log('Now Client(%r) is the engine user' % ws)
		return

	if message == 'stop': 
		engine.stop()
		clear_msg_queue()

	elif message == "ponder":
		clear_msg_queue()
		engine.ponder_fen()

	elif message.startswith('move'): 
		clear_msg_queue()
		move = message[4 : ].strip()
		if len(move) == 4:
			engine.make_move(move)
		else:
			engine.make_move()

		ws.send('fen: %s' % board.get_fen())

	elif message.startswith('fen:'): 

		clear_msg_queue()
		new_fen = message[4 : ].strip()
		if not engine.ponder_fen(new_fen):
			ws.send('invalid fen: %s' % new_fen)


def new_client(ws):
	if not ws == engine.engine_user:
		ws.send("fen: " + board.get_fen())

def client_left(ws):
	if ws == engine.engine_user:
		engine.engine_user = None
		engine.stop()

@app.route('')
@app.route('/')
def server_index():
	return static_file('index.html', root = 'html')

@app.route('/<filepath:path>')
def server_static(filepath):
	return static_file(filepath, root = 'html')

@app.route('/ws/')
def handle_websocket():
	ws = request.environ.get('wsgi.websocket')
	if not ws:
		abort(400, 'Expected WebSocket request.')

	new_client(ws)
	clients.add(ws)

	while True:
		try:
			message = ws.receive()
		except WebSocketError:
			break

		if message is None:
			break

		process_msg(ws, message)

	try:
		clients.remove(ws)
	except:
		pass
	client_left(ws)


def start_server(interface, port):
	server = WSGIServer((interface, port), app,
					handler_class = WebSocketHandler)
					
	log('please point your browser to http://%s:%d' % (interface, port))

	broadcaster_thread = threading.Thread(target = message_broadcaster)
	broadcaster_thread.start()

	server.serve_forever()
