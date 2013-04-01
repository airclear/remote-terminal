Remote Terminal
===============

Remote Terminal allows an interactive script to be accessed remotely, though it is recommended to use an SSH tunnel. For something like a [Minecraft](http://minecraft.net) server, the server is a Java app that runs in a terminal, but only that specific terminal can access it. If you lose connection, then the server can only be communicated with in game. If you run the server with remote terminal as a wrapper, then you can connect to it later and control it, as long as the remote terminal server continues to run. This contains a basic username/password system, but it only md5's the password and compares the hash with the hash on the server.


### To start the server:
``` shell
remote-terminal-server -u JoshTheGeek -p your-password-here java -jar minecraft_server.jar &
```

### To connect to the server:
``` shell
ssh -fNL 8081:localhost:8081 user@serverAddress
remote-terminal-client -u JoshTheGeek -p your-password-here localhost:8081
```
That opens a tunnel to user@serverAddress, so port 8081 locally is securely transferred to port 8081 on serverAddress. Then the client connects to the remote terminal server through the tunnel. To kill the tunnel later, just
``` shell
killall ssh
```
