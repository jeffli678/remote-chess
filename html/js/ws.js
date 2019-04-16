var ws;
    
function init() {

  // Connect to Web Socket
  host =  window.location.host;

  if (window.location.protocol.startsWith('https')){
    // if the https does not run on port 443, specify a port here!
    websocket_addr = 'wss://' + host + '/ws/';
  }
  else{
    websocket_addr = 'ws://' + host + '/ws/';
  }
 
  ws = new WebSocket(websocket_addr);


  // Set event handlers.
  ws.onopen = function() {
    output("Connected to server");
    auth();
  };
  
  ws.onmessage = function(e) {
    // e.data contains received string.
    process_message(e.data);
  };
  
  ws.onclose = function() {
    output("Fail to connect to server. Reconnect in 2 seconds.");
    setTimeout(init, 2000);
  };

  ws.onerror = function(e) {
    // output("fail to connect to server");
    console.log(e)
  };

}
    
function onCloseClick() {
  ws.close();
}

function process_message(m){
  // fen: rnb.....
  if(m.substring(0, 5) == "fen: "){
    pos_fen = m.substring(5);
    document.getElementById('board_str').value = pos_fen;
    window.history.pushState(null, '', '#' + pos_fen);
    initBoardPos(pos_fen);
  } else {
    output(m);
    if (m == 'auth fail')
    {
      auth(true);
    }
  }
}

function output(str) {
  var log = document.getElementById("log");
  var escaped = str.replace(/&/, "&amp;").replace(/</, "&lt;").
    replace(/>/, "&gt;").replace(/"/, "&quot;"); // "
  log.innerHTML = escaped + "<br>" + log.innerHTML;
}


function ponder(){
  var status = document.getElementById("ponder").innerHTML;
  if(status == "思考"){
    var fen = document.getElementById("board_str").value;
    document.getElementById("ponder").innerHTML = "暂停";
    document.getElementById("move").disabled = false;
    document.getElementById("move").focus();
    send_fen(fen);
  } else {
    document.getElementById("ponder").innerHTML = "思考";
    document.getElementById("move").disabled = true;
    ws.send("stop");
  }
  
}

function send_fen(fen)
{
  ws.send('fen: ' + fen);
}

function stop_ponder()
{
  document.getElementById("ponder").innerHTML = "思考";
  document.getElementById("move").disabled = true;
  ws.send("stop");
}

function move(){
  ws.send('move');
}

function auth(last_auth_fail = false){

  if(localStorage.passwd && !last_auth_fail)
	{
		passwd = localStorage.passwd;
	}
	else
	{
		passwd = prompt('请输入系统密码:');
		localStorage.passwd = passwd;
  }
  ws.send('passwd ' + passwd);

}