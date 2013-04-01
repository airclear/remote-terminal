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
console.log('Cmd: ' + cmd);
console.log(args);

var child = childProcess.spawn(cmd, args, {
	cwd: '.'
});
if (!argv['disable-output']) {
	console.log('Registering child process IO listeners...');

	process.stdin.resume();
	process.stdin.on('data', function(data) {
		// console.log('Stdin data: ' + data);
		child.stdin.write(data);
	});
	
	child.stdout.on('data', function(data) {
		// console.log('Stdout data: ' + data);
		process.stdout.write(data);
	});

	child.stderr.on('data', function(data) {
		// console.log('Stderr data: ' + data);
		process.stderr.write(data);
	});
}
process.on('exit', function() {
	child.kill();
	// console.log('Killed child process');
});
child.on('exit', function() {
	console.log('Child process died, exiting');
	process.exit();
})

var server = new serverObj(child.stdout, child.stderr, child.stdin, argv.user || argv.u || '', argv.pass || argv.p || '');
server.listen(argv.port || process.env.PORT || false);