#!/usr/local/bin/node
// remote-terminal by JoshTheGeek

var serverObj = require('../index').RemoteTerminalServer;
var childProcess = require('child_process');


var optimist = require('optimist')
			   .usage('Usage: $0 [options] <script>')
			   .describe('user', 'Username to require').alias('user', 'u')
			   .describe('pass', 'Password').alias('pass', 'p')
			   .describe('port', 'Port to listen on')
			   .describe('help', 'Show this help').boolean('help');
var argv = optimist.argv;

if (argv.help) {
	console.log(optimist.help());
	process.exit();
}

if (argv._.length == 0) {
	console.error('A command is required!');
	process.exit();
}

var cmd = argv._.shift();
var args = argv._;

var child = childProcess.spawn(cmd, args, {
	cwd: '.'
});

if (!argv['disable-output']) {
	process.stdin.resume();
	process.stdin.on('data', function(data) {
		child.stdin.write(data);
	});
	
	child.stdout.on('data', function(data) {
		process.stdout.write(data);
	});

	child.stderr.on('data', function(data) {
		process.stderr.write(data);
	});
}

process.on('exit', function() {
	child.kill();
});
child.on('exit', function() {
	console.log('Child process died, exiting');
	process.exit();
});

var server = new serverObj(child.stdout, child.stderr, child.stdin, argv.user || '', argv.pass || '');
server.listen(argv.port || process.env.PORT || false);