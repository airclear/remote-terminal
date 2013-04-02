#!/usr/local/bin/node
// remote-terminal by JoshTheGeek

var clientObj = require('../index').RemoteTerminalClient;


var optimist = require('optimist')
			   .usage('Usage: $0 [options]')
			   .describe('user', 'Username').alias('user', 'u')
			   .describe('pass', 'Password').alias('pass', 'p')
			   .describe('host', 'Host to connect to').alias('host', 'h')
			   .describe('port', 'Port to connect to (or env.PORT)').check(function(val) {
			   	   var isNum = !isNaN(new Number(val));
			   	   if (!isNum) throw new Error('--port must be a number!');
			       return isNum; // Ensure port is a number
			   })
			   .describe('help', 'Show this help').boolean('help');
var argv = optimist.argv;

if (argv.help) {
	console.log(optimist.help());
	process.exit();
}

process.stdin.resume();
var client = new clientObj(argv.host || argv.h || false, argv.port || process.env.PORT || false, process.stdout, process.stderr, process.stdin, argv.user || argv.u || '', argv.pass || argv.p || '');
