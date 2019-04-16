var boardTextHeight=12;
var boardRowHeight=51;
var lastClickPos=null;

var nextAddPiece="null";
var add_piece=false;

var pieceMap=[['rK','rA','rB','rN','rR','rC','rP'],['bk','ba','bb','bn','br','bc','bp']];
up_side_down = false;
pos_fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';

window.onload=function()
{
	if(window.location.hash != ""){
		pos_fen = window.location.hash.substring(1);
	}else{
		pos_fen="rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w";
		window.history.pushState(null, '', '#' + pos_fen);
	}

	drawBoard();
	initBoardPos(pos_fen);

	document.getElementById('table_board').addEventListener('mousedown', board_click);
	document.getElementById('piece_list').addEventListener('click', piece_list_click);

	// disable drag
	// for(i=0;i<10;i++)
	// {
	// 	for(j=0;j<9;j++)
	// 	{
	// 		document.getElementById('td_'+i+j).addEventListener('dragstart', td_dragstart);
	// 		document.getElementById('td_'+i+j).addEventListener('dragover', td_dragover);
	// 		document.getElementById('td_'+i+j).addEventListener('drop', td_drop);
	// 	}
	// }

	// document.getElementById('piece_list').addEventListener('dragstart', pl_dragstart);
	// document.getElementById('piece_list').addEventListener('dragover', pl_dragover);
	// document.getElementById('piece_list').addEventListener('drop', pl_drop);

	prevent_right_click_menu();
	show_mobile_display();

	// document.addEventListener('keypress', function(e){
	// 	if(e.code == 'Space')
	// 	{
	// 		document.getElementById('move').click();
	// 	}
	// });
	
	init();
}

function engine_pondering(){
	return document.getElementById('ponder').innerHTML == "暂停";
}

function switch_next_move(){
	updateFEN();
	var status = document.getElementById("ponder").innerHTML;
	if(status == "思考"){
	  document.getElementById("ponder").innerHTML = "暂停";
	  document.getElementById("move").disabled = false;
	  document.getElementById("move").focus();
	}
	send_fen(pos_fen);
}

function prevent_right_click_menu()
{
	document.oncontextmenu=function()
	{
		return false;
	}
}

function getRelativePos(e)
{
	var r=e.currentTarget.getBoundingClientRect();
	return{x:e.clientX-r.left,y:e.clientY-r.top};
}

function getBoardPos(pos)
{
	return{x:parseInt(pos.x/boardRowHeight),y:parseInt((pos.y-boardTextHeight)/boardRowHeight)};
}

function updateFEN()
{
	var board=document.getElementById('table_board');
	var fen="";

	board_data = make_zero_array(10, 9);
	for(i = 0; i < 10; i++)
	{
		for(j = 0; j < 9; j++)
		{
			// the class name stores the piece type info
			board_data[i][j] = board.rows[i+1].cells[j].className[7];
		}
	}

	if (up_side_down)
	{
		switch_up_side_down(board_data);
	}

	for(var i=0;i<10;i++)
	{
		var fenSeg="";
		for(var j=0;j<9;j++)
		{
			fenSeg += board_data[i][j];
		}

		var fenSegCat="";
		for(k=0;k<9;k++)
		{
			// null, no piece
			if(fenSeg[k]!='u')
			{
				fenSegCat+=fenSeg[k];
			}
			else
			{
				var counter=1;
				while (fenSeg[k+counter]=='u')
				{
					counter++;
				}
				fenSegCat+=counter;
				k+=(counter-1);
			}
		}

		// console.log(fenSegCat);
		fen+=(fenSegCat+(i<9?'/':''));
	}

	fen+=(document.getElementById('red_move').checked?' w':' b');
	document.getElementById('board_str').value=fen;

	pos_fen = fen;
    window.history.pushState(null, '', '#' + pos_fen);

	lastClickPos=null;
	return fen
}

function piece_list_click(e)
{
	add_piece=true;
	var pos=getRelativePos(e);
	pos={x:parseInt(pos.x/boardRowHeight),y:parseInt(pos.y/boardRowHeight)};
	nextAddPiece=pieceMap[pos.y][pos.x];
}

//dragging also triggers this function, as it is bind to mousedown event
function board_click(e)
{
	var pos=getRelativePos(e);
	//clicked in the text area
	if(pos.y<boardTextHeight || pos.y>boardRowHeight*10+boardTextHeight) return;

	pos=getBoardPos(pos);
	// console.log('x: '+pos.x+' y: '+pos.y);

	var board=document.getElementById('table_board');
	var targetCell=board.rows[pos.y+1].cells[pos.x];

	//delete a piece
	if(e.button==2){
		targetCell.className="chess null";
		updateFEN();
		return;
	}

	//add a piece
	if(add_piece)
	{
		targetCell.className="chess "+nextAddPiece;
		add_piece=false;
		updateFEN();
		return;
	}

	//move a piece
	if(lastClickPos==null)
	{
		if(targetCell.className!=="chess null")
		{
			//first click
			lastClickPos=pos;
		}
	}
	else
	{
		//second click
		if(lastClickPos.x!=pos.x || lastClickPos.y!=pos.y)
		{
			var sourceCell=board.rows[lastClickPos.y+1].cells[lastClickPos.x];
			targetCell.className=sourceCell.className;
			sourceCell.className="chess null";
			if (engine_pondering()){
				if (document.getElementById('red_move').checked){
					document.getElementById('black_move').checked = true;
				}else{
					document.getElementById('red_move').checked = true;
				}
				var pos_fen = updateFEN();
				send_fen(pos_fen);
			}
			else {
				pos_fen = updateFEN();
			}

		}
		lastClickPos=null;
	}
}

function clearBoard()
{
	pos_fen = '5k3/9/9/9/9/9/9/9/9/4K4 w';
    window.history.pushState(null, '', '#' + pos_fen);
	initBoardPos(pos_fen);
	stop_ponder();
}

function default_board()
{
	pos_fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';
    window.history.pushState(null, '', '#' + pos_fen);
	initBoardPos(pos_fen);
	stop_ponder();

}

function switch_piece(board, i, j, i1, j1)
{
	piece_old = board[i][j];
	board[i][j] = board[i1][j1];
	board[i1][j1] = piece_old;
}

function switch_up_side_down(board_data)
{
	for(i = 0; i <= 4; i ++)
	{
		for(j = 0; j < 9; j++)
		{
			i_pair = 9 - i;
			j_pair = 8 - j;
			switch_piece(board_data, i, j, i_pair, j_pair);
		}
	}
}

function switch_class_name(board, i, j, i1, j1)
{
	old_class = board.rows[i].cells[j].className;
	board.rows[i].cells[j].className = board.rows[i1].cells[j1].className;
	board.rows[i1].cells[j1].className = old_class;
}


// note, changing red and black should NOT change the fen. Only the display is changed!
function change_red_black()
{
	up_side_down = !up_side_down;
	initBoardPos(pos_fen);
}

// However, changing the left and right should change the board display and the fen
function change_left_right()
{
	// left_side_right = !left_side_right;
	// initBoardPos(pos_fen);
	var board = document.getElementById('table_board');

	for(i = 1; i <= 10; i ++)
	{
		for(j = 0; j < 4; j++)
		{
			i_pair = i;
			j_pair = 8 - j;
			switch_class_name(board, i, j, i_pair, j_pair);
		}
	}

	updateFEN();
	send_fen(pos_fen);
}

function drawBoard()
{
	var html_seg='<table id="table_board" class="table_board" cellpadding="0px" cellspacing="0px"><tbody>';

	//<td class="td_number">1</td>
	html_seg+='<tr>';
	for(i=1;i<=9;i++)
	{
		html_seg+='<td class="td_number">'+i+"</td>";
	}
	html_seg+='</tr>\n';

	for(i=0;i<10;i++)
	{
		html_seg+='<tr>';
		for(j=0;j<9;j++)
		{
			// html_seg+='<td class="chess" draggable="true" id=\"td_'+i+j+'\"></td>';
			// disable drag
			html_seg+='<td class="chess" id=\"td_'+i+j+'\"></td>';
		}
		html_seg+='</tr>\n';
	}

	html_seg+='<tr>';
	for(i=1;i<=9;i++)
	{
		html_seg+='<td class="td_number">'+(10-i)+"</td>";
	}
	html_seg+='</tr>\n';

	html_seg+='</tbody></table>';

	document.getElementById('board_div').innerHTML=html_seg;
}

function initBoardPos(board_str)
{
	// deal with the %20 in the url
	board_str = decodeURIComponent(board_str); 

	var move_side=board_str.split(' ')[1][0];
	if(move_side=='r' || move_side=='w')
	{
		document.getElementById('red_move').checked=true;
	}
	else
	{
		document.getElementById('black_move').checked=true;
	}

	board_str = board_str.split(' ')[0];
	document.getElementById('board_str').value = board_str + ' ' + move_side;

	var board_str_array = board_str.split('/');
	if(board_str_array.length != 10) return;

	board_data = make_zero_array(10, 9);
	for(i = 0; i < 10; i++)
	{
		var str = board_str_array[i]
		var pointer = 0;
		for(j = 0; j < str.length; j++)
		{
			if(isNaN(str[j]))
			{
				//piece
				board_data[i][pointer] = "chess "+(str[j]>='a' && str[j]<='z' ? 'b' :'r')+str[j];
				pointer++;
			}
			else
			{
				//null cells
				var num = parseInt(str[j]);
				for(k = 0; k < num; k++)
				{
					board_data[i][pointer + k] = "chess null";
				}
				pointer += num;
			}
		}
	}

	if (up_side_down)
	{
		switch_up_side_down(board_data);
	}

	var board = document.getElementById('table_board');
	for (i = 0; i < 10; i++)
	{
		for (j = 0; j < 9; j++)
		{
			board.rows[i + 1].cells[j].className = board_data[i][j];
		}
	}
}

function make_zero_array(dim1, dim2)
{
	a = new Array(dim1);
	for(i = 0; i < dim1; i++)
	{
		a[i] = new Array(dim2);
	}
	return a;
}

function delay(ms) {
   ms += new Date().getTime();
   while (new Date() < ms){}
}

function history_back(){
	history.back();
	// fen_from_history();
}


function history_forward(){
	history.forward();
	// fen_from_history();
}

function fen_from_history()
{
	if(window.location.hash != ""){
		pos_fen = window.location.hash.substring(1);
		pos_fen = decodeURIComponent(pos_fen); 
	}else{
		pos_fen="rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w";
		window.history.pushState(null, '', '#' + pos_fen);
	}

	initBoardPos(pos_fen);
	if(engine_pondering()){
		send_fen(pos_fen);``
	}
}

window.onpopstate = function(event) {

	fen_from_history();
};

function screenshot(){
	html2canvas(document.querySelector("#table_board")).then(canvas => {
		var link = document.getElementById('link');
		link.setAttribute('download', 'capture.png');
		link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
		link.click();
});
}
