#Subgos

A simple nodejs web server framework.  [site](http://git.oschina.net/ddm/sugos "sugos")




`npm install subgos`


###Quick Start



	require('subgos');
	var http   = require('http');

	var server = http.createServer().listen(8888);

	server.get('/', function(req, res) {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end('Hello World');
	});




usage see demo.js
