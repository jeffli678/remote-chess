# remote-chess
remote-chess is a web UCCI front-end.

## 1. Prepare chess engine

Put the .exe of your engine in the engine folder. If it requires any license file(s), also put them in this folder. Make sure the engine can work properly.

This repo comes with the free version of NewGG (https://github.com/leedavid/leela-chess-to-Chinese-Chess). Many thanks to the author!

## 2. Change config.json

auth_passwd is your personal password. You probably want to change this. You need to input this before using the engine. 

engine_exe is the name of the engine executable. 

listen_interface and listen_port specify which interface and port will the program listen on (locally). If you are not sure what they mean, leave them unchanged. With the default setting, you can access the engine from http://localhost:8000. 

Enable frp_reverse_proxy if you wish to access the engine from the public network. frp (https://github.com/fatedier/frp) is a reverse proxy. 

frp_server, frp_auth_port and frp_token specify the frps server you will use. This should be found online and is not part of this repo. For more information, google "free frp server".

frp_remote_port specify the port number you will be accessing the engine from the public network. This must be unique. So you would better change it to avoid potential conflict. Under the default setting, the engine should be accessible at: http://frpzj.kskxs.com:53390. 

## 3. Run it

Double click the launch.bat and point your browser to http://localhost:8000 or http://frpzj.kskxs.com:53390. You should be prompted to input your password. Then you can set a position and start analysis. If anything goes wrong, manually run python code/main.py to see more details. 
