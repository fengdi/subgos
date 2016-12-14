#Subgos
[![](https://img.shields.io/npm/v/subgos.svg)](https://www.npmjs.com/package/subgos) ![](https://img.shields.io/npm/dt/subgos.svg) ![](https://img.shields.io/npm/l/subgos.svg) ![](https://img.shields.io/node/v/subgos.svg)

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
