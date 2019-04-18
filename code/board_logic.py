# encoding: utf-8
import re
import collections
from log_util import log

rows_count = 10
columns_count = 9

pieces_abbr = 'rnbakcpRNBAKCP'
pieces_name = u'车马象士将炮卒车马相仕帅炮兵'
piece_map = {}
for i in range(len(pieces_abbr)):
	piece_map[pieces_abbr[i]] = pieces_name[i]

num_map = [u'一', u'二', u'三', u'四', u'五', u'六', u'七', u'八', u'九']

class Board():

	def __init__(self, *args, **kwargs):
		self.fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'
		self.last_made_move = ''
		self.best_move = ''

	def get_fen(self):
		return self.fen

	def set_fen(self, fen):
		self.fen = fen

	

	# ================ omitted ===============================
	# XQMS Use uci[ucci] protocol
	# info depth 7
	# info depth 7 score 7 time 70 nodes  28145 nps 402071 pv b2e2 b9c7 a0a1 c6c5 b0c2 a9b9 a1f1
	# info depth 7 score 32 time 73 nodes  33349 nps 456835 pv b0c2 b7e7 a0a1 b9c7 c3c4 a9b9 a1f1
	# info depth 8
	# info depth 8 score 16 time 77 nodes  44138 nps 573220 pv b0c2 b7e7 a0a1 b9c7 c3c4 a9b9 a1f1 b9b5

	# ================ omitted ===============================
	# info depth 15
	# info depth 15 score 42 time 775 nodes 3719702 nps 4799615 pv h2e2 b9c7 h0g2 h9g7 i0h0 i9h9 c3c4 g6g5 b0c2 a9a8 h0h4 a8d8 g3g4 g5g4 h4g4

	def board_to_fen(self, board, move_side):
		fen = []

		for line in board:
			line_str = ''.join(line)
			fen.append(re.sub(r'(\s+)', lambda m: str(len(m.group(0))), line_str))

		fen_str = '/'.join(fen) + ' ' + move_side

		if not self.is_valid_fen(fen_str):
			log('board_to_fen() generates invalid fen: %s ' % fen_str)

		return fen_str

	def is_valid_fen(self, fen):

		valid_fen = True

		try:
		
			if not fen: fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"
			fen = fen.strip()
			move_side = fen[-1]
			if move_side not in ['w', 'b']: 
				raise Exception

			board_str = fen.split(' ')[0]
			rows_str = board_str.split('/')
			if len(rows_str) != rows_count: 
				raise Exception

			for row_str in rows_str:
				row = []
				for char in row_str:
					if char.isdigit():
						num = int(char)
						row.extend([' '] * num)
					else:
						if not char in pieces_abbr:
							raise Exception
						row.append(char)
				
				if not len(row) == columns_count:
					raise Exception
			
		except Exception:
			valid_fen = False

		if not valid_fen:
			log('unexpected fen: %s' % fen)

		return valid_fen

	def fen_to_board(self, fen):

		board = []

		if not fen: fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"
		fen = fen.strip()
		move_side = fen[-1]
		if move_side not in ['w', 'b']: move_side = 'w'

		board_str = fen.split(' ')[0]
		rows_str = board_str.split('/')
		if len(rows_str) != rows_count: 
			log('unexpected board_str: %s' % board_str)
			return (board, move_side)
		
		for row_str in rows_str:
			row = []
			for char in row_str:
				if char.isdigit():
					num = int(char)
					row.extend([' '] * num)
				else:
					row.append(char)

			board.append(row)

		return (board, move_side)

	def is_red_piece(self, piece):
		return piece.isupper()

	def parse_pos(self, pos_str):
		column = ord(pos_str[0]) - ord('a')
		row = rows_count - 1 - int(pos_str[1])
		return [row, column]

	def piece_action(self, piece_abbr, start_row, end_row):
		# not the row is the board row. not the natural wor
		action = ''
		is_red = self.is_red_piece(piece_abbr)

		if start_row == end_row:
			action = u'平'
		elif start_row < end_row:
			if is_red:
				action = u'退'
			else:
				action = u'进'
		else:	
			if is_red:
				action = u'进'
			else:
				action = u'退'

		return action

	def get_row_str(self, piece_abbr, column):

		if self.is_red_piece(piece_abbr):
			row_str = num_map[columns_count - 1 - column]

		else:
			row_str = str(column + 1)

		return row_str

	def get_piece_end(self, piece_abbr, action, start_row, start_column, end_row, end_column):

		piece_end = ''
		if action == u'平' or piece_abbr.lower() in ['n', 'b', 'a']:
			piece_end = self.get_row_str(piece_abbr, end_column)
		else:
			dist = abs(start_row - end_row)
			if self.is_red_piece(piece_abbr):
				piece_end = num_map[dist - 1]
			else:
				piece_end = str(dist)

		return piece_end

	def get_piece_rel_pos(self, board, piece_abbr, curr_row, curr_column):

		rel = ''
		# 士相帅不考虑
		if piece_abbr in 'aAbBkK': return rel

		# red
		if self.is_red_piece(piece_abbr):
			for row in range(0, curr_row):
				if board[row][curr_column] == piece_abbr:
					rel = u'后'
			for row in range(curr_row + 1, rows_count):
				if board[row][curr_column] == piece_abbr:
					rel = u'前'
		# black
		else:
			for row in range(0, curr_row):
				if board[row][curr_column] == piece_abbr:
					rel = u'前'
			for row in range(curr_row + 1, rows_count):
				if board[row][curr_column] == piece_abbr:
					rel = u'后'

		return rel

	def update_board(self, board, move):
		if len(move) != 4: return board

		start = move[:2]
		end = move[-2:]
		(start_row, start_column) = self.parse_pos(start)
		(end_row, end_column) = self.parse_pos(end)
		# update board
		board[end_row][end_column] = board[start_row][start_column]
		board[start_row][start_column] = ' '
		return board


	def parse_move(self, board, move, commit_move = True):

		if len(move) != 4: 
			if commit_move: 
				return (board, '')
			else:
				return ''

		start = move[:2]
		end = move[-2:]

		(start_row, start_column) = self.parse_pos(start)
		(end_row, end_column) = self.parse_pos(end)

		piece_abbr = board[start_row][start_column]
		try:
			piece = piece_map[piece_abbr]
		except:
			piece = '?'
		
		# 前 后
		piece_rel_pos = self.get_piece_rel_pos(board, piece_abbr, start_row, start_column)

		if piece_rel_pos:
			piece_start = ''
		else:
			piece_start = self.get_row_str(piece_abbr, start_column)

		action = self.piece_action(piece_abbr, start_row, end_row)

		piece_end = self.get_piece_end(piece_abbr, action, start_row, start_column, end_row, end_column)

		move_str = piece_rel_pos + piece + piece_start + action + piece_end

		if commit_move:
			board = self.update_board(board, move)
			return (board, move_str)
		else:
			return move_str


	def parse_moves(self, board, moves):

		parsed_moves = []
		for move in moves:
			(board, parsed_move) = self.parse_move(board, move)
			parsed_moves.append(parsed_move)

		return parsed_moves

	def make_move(self, move = ''):

		if move == '' or move == 'ponderhit':
			if self.last_made_move == self.best_move:
				# the new best move is not yet updated. wait. just do nothing
				return
			else:
				move = self.best_move
				self.last_made_move = self.best_move

		(board, move_side) = self.fen_to_board(self.fen)
		log('make_move: ' + self.parse_move(board, move, False))

		self.board = self.update_board(board, move)
		
		if move_side == 'w': next_move_side = 'b'
		if move_side == 'b': next_move_side = 'w'

		self.fen = self.board_to_fen(board, next_move_side)


	def parse_engine_info(self, line):
		
		info_split = line[5:].split()
		info = collections.defaultdict(str)
		i = 0
		
		while i < len(info_split) - 1:
			if info_split[i] == 'pv':
				info['moves'] = info_split[i + 1 : ]
				break
			info[info_split[i]] = info_split[i + 1]
			i += 2

		return info

	def format_engine_line_info(self, line):

		info = self.parse_engine_info(line)
		if 'moves' in info:

			depth = info['depth']

			score = info['score']
			if not score: score = '0'

			ponder_time = info['time']
			if not ponder_time: ponder_time = '0'

			moves = info['moves']
			log(moves)
			self.best_move = moves[0]

			(board, move_side) = self.fen_to_board(self.fen)

			moves_str = self.parse_moves(board, moves)
			move_str_cat = ' '.join(moves_str)

			if move_side == 'b':
				score = str(-int(score))

			ponder_time = '%.1f' % (int(ponder_time) / 1000.0)
			output_str = '\t'.join([depth, score, ponder_time, move_str_cat])

			log(output_str)
			return output_str


board = Board()