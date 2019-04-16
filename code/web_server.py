# encoding: utf-8
import time
from bottle import request, Bottle, abort, static_file

from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

from engine_ctrl import engine
from board_logic import board

app = Bottle()
clients = set()

def process_msg(ws, message):
	
	check_ret = engine.check_user(ws, message)
	if check_ret == 'verify fail':
		ws.send('You must first be authenticated to use the engine')
		ws.send('auth fail')
		return
	elif check_ret == 'verify ok':
		ws.send('Now you can use the engine')
		print('Now Client(%r) is the engine user' % ws)
		return

	if message == 'stop': 
		engine.stop()

	elif message == "ponder":
		engine.ponder_fen()

	elif message.startswith('move'): 
		move = message[4 : ].strip()
		if len(move) == 4:
			engine.make_move(move)
		else:
			engine.make_move()

		ws.send('fen: %s' % board.get_fen())

	elif message.startswith('fen:'): 

		new_fen = message[4 : ].strip()
		if not engine.ponder_fen(new_fen):
			ws.send('invalid fen: %s' % new_fen)


def broadcast_msg(message):
	for ws in clients:
		try:
			ws.send(message)
		except:
			pass

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
					
	print('please point your browser to http://%s:%d' % (interface, port))
	server.serve_forever()
