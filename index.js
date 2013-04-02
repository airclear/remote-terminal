// remote-terminal by JoshTheGeek

var kDefaultPort = 8081;
var dnode = require('dnode');
var net = require('net');
var crypto = require('crypto');

var gray = '\033[1m\033[30m';
var reset = '\033[0m';


exports.md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

exports.RemoteTerminalServer = function(stdout, stderr, stdin, user, pass) {
	this.port = -1;
	this.stdout = stdout;
	this.stderr = stderr;
	this.stdin = stdin;
	this.user = (user && user != '') ? user : '';
	this.pass = (pass && pass != '') ? exports.md5(pass) : '';
	var self = this;

	function auth(user, pass) {
		if (self.user && self.pass && (self.user != user || self.pass != pass)) return false;
		return true;
	}

	this.server = net.createServer(function(stream) {
		var session = {
			sendStdin: function(msg, cb) {
				if (!cb) cb = function() {};
				msg = msg.toString();

				console.log(gray + '[Remote -> Server] ' + msg.slice(0, -1) + reset);
				cb(self.stdin.write(msg));
			},
			attachStdoutListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stdout.on(event || 'data', function(data) {
					listener(data.toString());
				}));
			},
			attachStderrListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stderr.on(event || 'data', function(data) {
					listener(data.toString());
				}));
			},
			removeStdoutListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stdout.removeListener(event || 'data', listener));
			},
			removeStderrListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stderr.removeListener(event || 'data', listener));
			},
			stdin: function(cb) {
				cb(self.stdin);
			},
			stdout: function(cb) {
				cb(self.stdout);
			},
			stderr: function(cb) {
				cb(self.stderr);
			}
		}
		self.d = dnode({
			auth: function(user, pass, cb) {
				if (!auth(user, pass)) return cb('Bad username or password!');

				cb(null, session);
			}
		});

		self.d.pipe(stream).pipe(self.d);
	});
	
	this.listen = function(port) {
		self.port = port;
		self.server.listen(port || kDefaultPort);
	}
}

exports.RemoteTerminalClient = function(host, port, stdout, stderr, stdin, user, pass, remoteCallback) {
	this.port = port || kDefaultPort;
	this.host = host;
	this.stdout = stdout;
	this.stderr = stderr;
	this.stdin = stdin;
	this.user = (user && user != '') ? user : '';
	this.pass = (pass && pass != '') ? exports.md5(pass) : '';
	this.remoteCallback = remoteCallback;
	var self = this;
	this.remote = null;

	this.d = self.host ? dnode.connect(self.host, self.port) : dnode.connect(self.port);
	this.d.on('remote', function(remote) {
		self.remote = remote;
		remote.auth(self.user, self.pass, function(err, session) {
			if (err) {
				stderr.write('Error authenticating with remote: ' + err + '\n');
				self.d.end();
				process.exit();

				return;
			}

			if (self.stdout) {
				session.attachStdoutListener(function(data) {
					self.stdout.write(data.toString());
				});
			}

			if (self.stderr) {
				session.attachStderrListener(function(data) {
					self.stderr.write(data.toString());
				});
			}

			if (self.stdin) {
				self.stdin.on('data', function(data) {
					session.sendStdin(data.toString());
				});
			}

			self.remoteCallback(remote);
		});
	});

	this.d.on('end', function() {
		self.stderr.write('Connection lost!\n');
		process.exit();
	});
}