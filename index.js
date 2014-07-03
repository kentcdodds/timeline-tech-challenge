var argv = require('minimist')(process.argv.slice(2)),
	port = argv.p || 3000,
	http = require('http'),
	fs = require('fs'),
    path = require('path'),
	server;

// Respond to request with a 404 error
function send404(res) {
	res.writeHead(404);
	res.write('404 Not Found');
	res.end();
}

server = http.createServer(function (req, res) {
	console.log(req.url);

	var url = null,
		file;

	// Whitelist files so that protected files can't be requested
	if (req.url === '/' || req.url === '/index.html') {
		url = 'index.html'
	} else if (req.url === '/timeline.json') {
		url = 'timeline.json';
	} else if (req.url.indexOf('/css/') === 0) {
		url = req.url;
	} else if (req.url.indexOf('/dist/') === 0) {
		url = req.url;
	}

	// If file exists pipe it to response, otherwise send 404
	if (url !== null) {
		file = path.join(__dirname, url);
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
