// remote-terminal by JoshTheGeek

var kDefaultPort = 8081;
var dnode = require('dnode');
var net = require('net');


exports.md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

exports.RemoteTerminalServer = function(port, stdout, stderr, stdin, user, pass) {
	this.port = port;
	this.stdout = stdout;
	this.stderr = stderr;
	this.stdin = stdin;
	this.user = user;
	this.pass = pass ? exports.md5(pass) : null;;
	var self = this;

	function auth(user, pass) {
		if (self.user && self.pass && (self.user != user || self.pass != pass)) return false;
		return true;
	}

	this.server = net.createServer(function(stream) {
		var session = {
			sendStdin: function(msg, cb) {
				if (!cb) cb = function() {};

				cb(self.stdin.write(msg));
			},
			attachStdoutListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stdout.on(event || 'data', listener));
			},
			attachStderrListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stderr.on(event || 'data', listener));
			},
			removeStdoutListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stdout.removeListener(event || 'data', listener));
			},
			removeStderrListener: function(listener, event, cb) {
				if (!cb) cb = function() {};

				cb(self.stderr.removeListener(event || 'data', listener));
			}
		}
		self.d = dnode({
			auth: function(user, pass, cb) {
				if (!auth(user, pass)) return cb('Bad username or password!');

				cb(null, session);
			}
		});

		self.d.pipe(stream).pipe(d);
	});
	
	this.listen = function() {
		this.server.listen(port || kDefaultPort);
	}
}

exports.RemoteTerminalClient = function(host, port, stdout, stderr, stdin, user, pass) {
	this.port = port || kDefaultPort;
	this.host = host;
	this.stdout = stdout;
	this.stderr = stderr;
	this.stdin = stdin;
	this.user = user;
	this.pass = pass ? exports.md5(pass) : null;
	var self = this;
	this.remote = null;

	this.d = host ? dnode.connect(host, port) : dnode.connect(port);
	this.d.on('remote', function(remote) {
		self.remote = remote;
		remote.auth(self.user, self.pass, function(err, session) {
			if (err) {
				stderr.write('Error authenticating with remote: ' + err + '\n');
				self.d.end();

				return;
			}

			if (self.stdout) {
				session.attachStdoutListener(function(data) {
					self.stdout.write(data);
				});
			}

			if (self.stderr) {
				session.attachStderrListener(function(data) {
					self.stderr.write(data);
				});
			}

			if (self.stdin) {
				self.stdin.on('data', function(data) {
					session.sendStdin(data);
				});
			}
		});
	});
}