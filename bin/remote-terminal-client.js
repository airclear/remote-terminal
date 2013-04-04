#!/usr/local/bin/node
// remote-terminal by JoshTheGeek

var clientObj = require('../index').RemoteTerminalClient;


var optimist = require('optimist')
			   .usage('Usage: $0 [options]')
			   .describe('user', 'Username').alias('user', 'u')
			   .describe('pass', 'Password').alias('pass', 'p')
			   .describe('host', 'Host to connect to').alias('host', 'h')
			   .describe('port', 'Port to connect to (or env.PORT)')
			   .describe('help', 'Show this help').boolean('help');
var argv = optimist.argv;

if (argv.help) {
	console.log(optimist.help());
	process.exit();
}

process.stdin.resume();
var client = new clientObj(argv.host || false, argv.port || process.env.PORT || false, process.stdout, process.stderr, process.stdin, argv.user || '', argv.pass || '', function(session, remote) {
	session.attachStdoutListener(function(stdout) {
		console.log('Remote script stopped! Stopping...');
	}, 'close');
});
