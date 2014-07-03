var argv = require('minimist')(process.argv.slice(2)),
	port = argv.p || 3000,
	http = require('http'),
	fs = require('fs'),
    path = require('path'),
	server;

server = http.createServer(function (req, res) {
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
});

server.listen(port);
console.log('listening on port ' + port);
