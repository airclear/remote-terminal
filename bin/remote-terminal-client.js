// remote-terminal by JoshTheGeek

var clientObj = require('../index').RemoteTerminalClient;
var optimist = require('optimist');


var argv = require('optimist').argv;

process.stdin.resume();
var client = new clientObj(argv.host || argv.h || false, argv.port || process.env.PORT || false, process.stdout, process.stderr, process.stdin, argv.user || argv.u || '', argv.pass || argv.p || '');