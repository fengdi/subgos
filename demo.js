//var subgos = require('subgos');
var subgos = require('./index.js');
var http = require('http');


var server = subgos().listen(8888);

//same as:

//var server = http.createServer().listen(8888);

console.log('Server running at http://127.0.0.1:8888/');


//usage: router helloworld
//server.get()
//server.post()
//server.put()
//...

//helloworld
server.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World');
});




//usage: json and params
server.get('/json?id=:id', function(req, res) {
  console.log(req.params);
  res.json({type:'json', id:req.params.id});
});





//usage: ejs template
server.get('/tpl', function(req, res) {
  // https://github.com/mde/ejs

  // eg. res.tpl(str, data, options);

  // filename data options callback
  res.tplFile('demo.ejs', {foo:'bar'}, {}, function(){
      res.end();
  });

});





//usage: cookie
server.get('/cookie', function(req, res) {

  //get cookies
  var cookies = req.cookies();

  //set cookies
  res.cookies('foo', 'bar');

  res.json(cookies);

});





// 404
server.get('*', function(req, res) {
    res.statusCode = 404;
    res.end('404');
});
