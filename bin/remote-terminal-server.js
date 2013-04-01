// remote-terminal by JoshTheGeek

var serverObj = require('../index').RemoteTerminalServer;
var childProcess = require('child_process');


var argv = require('optimist').argv;
if (argv._.length == 0) {
	console.log('A command is required!');
	process.exit();
}

var cmd = argv._.shift();
var args = argv._;

var child = childProcess.spawn(cmd, args);
if (!argv['disable-output']) {
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

var server = new serverObj(child.stdout, child.stderr, child.stdin, argv.user || argv.u || '', argv.pass || argv.p || '');
server.listen(argv.port || process.env.PORT || false);