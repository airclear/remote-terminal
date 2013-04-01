// remote-terminal by JoshTheGeek

var clientObj = require('../index').RemoteTerminalClient;
var optimist = require('optimist');


var client = new clientObj(host, port, stdout, stderr, stdin, user, pass);