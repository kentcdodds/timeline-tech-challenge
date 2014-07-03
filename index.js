var argv = require('minimist')(process.argv.slice(2)),
	port = argv.p || 3000,
	http = require('http'),
	fs = require('fs'),
    path = require('path'),
	server;

// Respond to request with a 404 error
function send404(res) {
	res.writeHead(404);
	res.write('<h1>404 Not Found</h1>');
	res.end();
}

server = http.createServer(function (req, res) {
	var url = req.url,
		file = null;

	// Normalize index
	if (url === '/') {
		url = '/index.html';
	}

	// Whitelist files so that protected files can't be requested
	if (url === '/index.html' ||
		url === '/timeline.json' ||
		url.indexOf('/css/') === 0 ||
		url.indexOf('/dist/') === 0) {
		file = path.join(__dirname, url);
	}

	// If file exists pipe it to response, otherwise send 404
	if (file !== null) {
		fs.exists(file, function (exists) {
			if (!exists) {
				send404(res);
			} else {
				fs.createReadStream(file).pipe(res);
			}
		});
	} else {
		send404(res);
	}
});

server.listen(port);
console.log('listening on port ' + port);
