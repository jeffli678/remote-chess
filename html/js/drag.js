function td_dragstart(e)
{
	e.dataTransfer.setData('text',e.target.id+'_'+e.target.className[7]);
	// console.log(e.target.id+'_'+e.target.className[7]);
}

function pl_dragstart(e)
{
	var pos=getRelativePos(e);
	pos={x:parseInt(pos.x/boardRowHeight),y:parseInt(pos.y/boardRowHeight)};
	nextAddPiece=pieceMap[pos.y][pos.x];
	e.dataTransfer.setData('text',nextAddPiece);

	var dragImg=document.getElementById('dragimg');
	dragImg.className="chess "+nextAddPiece;
	var offsetX=dragImg.width/2;
	var offsetY=dragImg.height/2;
	e.dataTransfer.setDragImage(dragImg,offsetX,offsetY);
	// e.dataTransfer.setDragImage(dragImg,offsetX,offsetY);
	// console.log(nextAddPiece);
}

function pl_drop(e)
{
	var start_info=e.dataTransfer.getData('text');

	var board=document.getElementById('table_board');
	var sourceCell=board.rows[parseInt(start_info[3])+1].cells[parseInt(start_info[4])];

	sourceCell.className="chess null";
	updateFEN();
}

function td_drop(e)
{
	e.preventDefault();

	var start_info=e.dataTransfer.getData('text');
	var start_info_list=start_info.split('_');

	//td_54
	var end_pos_str=e.target.id;
	var end_pos={x:parseInt(end_pos_str[3]),y:parseInt(end_pos_str[4])};

	var board=document.getElementById('table_board');

	//in-board drag
	//td_00_r
	//["td", "77", "C"]

	if(start_info_list[0]=='td')
	{
		var start_piece=start_info_list[2];

		var start_pos_str=start_info_list[1];
		var start_pos={x:parseInt(start_pos_str[0]),y:parseInt(start_pos_str[1])};

		// console.log(start_pos,start_info,end_pos);

		if(start_pos.x!=end_pos.x || start_pos.y!=end_pos.y)
		{
			var targetCell=board.rows[end_pos.x+1].cells[end_pos.y];
			var sourceCell=board.rows[start_pos.x+1].cells[start_pos.y];

			targetCell.className=sourceCell.className;
			sourceCell.className="chess null";
			updateFEN();
		}
	}
	else
	//add a piece
	{
		var targetCell=board.rows[end_pos.x+1].cells[end_pos.y];
		targetCell.className="chess "+start_info;
	}	

	updateFEN();
}

function td_dragover(e)
{
	event.preventDefault();
}

function pl_dragover(e)
{
	event.preventDefault();
}