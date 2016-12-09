
//内置模块
var http = require('http');
var https = require('https');
var url = require('url');


//外部模块
var cookie = require('cookie'); //https://github.com/jshttp/cookie/
var ejs = require('ejs');
var Router = require('trek-router'); //https://github.com/trekjs/router
var finalhandler = require('finalhandler');


var assign = Object.assign;


//响应浏览器  相当于拓展 response
assign(http.ServerResponse.prototype, {
    cookies : function(name, val, options){
        this.setHeader('Set-Cookie', cookie.serialize(name, val, options));
    },
    json : function(data){
        var json = "";
        try{
            json = JSON.stringify(data);
        }catch(e){}
        this.writeHead(200, {'Content-Type': 'application/json'});
        this.end(json);
    },
    ejs : ejs,
    tpl : function(str, data, options){
        this.write(ejs.render(str, data, options));
    },
    tplFile : function(filename, data, options, callback){
        var self = this;
        ejs.renderFile(filename, data, options, function(err, str){
            if(!err){
                self.write(str);
            }
            if(typeof callback == 'function'){
                callback(err, str);
            }
        });
    }
});


//来自浏览器的请求 相当于拓展 request
assign(http.IncomingMessage.prototype, {
    cookies: function(){
        return cookie.parse(this.headers.cookie);
    },
    uri: function(){
        return url.parse(this.url);
    }
});



//http服务器扩展
var httpServerlisten = http.Server.prototype.listen;
assign(http.Server.prototype, {
    createRouter : function(){
        if(!this.router){
            this.router = new Router();
        }
    },
    add: function(method, rule, handle){
        this.createRouter();
        this.router.add(method, rule, handle);
    },
    find: function(method, url){
        this.createRouter();
        return this.router.find(method, url);
    },
    //rewrite listen
    listen : function(){
      this.createRouter();
      this.emit('listen');
      this.on('request', function(request, response){
          var result = this.find(request.method, request.url);
          if (result  && typeof result[0] == 'function') {
              request.params = {};
              result[1].forEach(function(param){
                request.params[param.name] = param.value;
              });
              return result[0](request, response);
          }
          finalhandler(request, response);
      });

      return httpServerlisten.apply(this, arguments);
    }
});
Router.METHODS.forEach(M => {
  Object.defineProperty(http.Server.prototype, M.toLowerCase(), {
    value: function verb (path, handler) {
        return this.add(M, path, handler);
    }
  });
  Object.defineProperty(https.Server.prototype, M.toLowerCase(), {
    value: function verb (path, handler) {
        return this.add(M, path, handler);
    }
  })
});


//https服务器扩展
var httpsServerlisten = https.Server.prototype.listen;
assign(https.Server.prototype, {
    createRouter : function(){
        if(!this.router){
            this.router = new Router();
        }
    },
    add: function(method, rule, handle){
        this.createRouter();
        this.router.add(method, rule, handle);
    },
    find: function(method, url){
        this.createRouter();
        return this.router.find(method, url);
    },
    //rewrite listen
    listen : function(){
      this.createRouter();
      this.emit('listen');
      this.on('request', function(request, response){
          var result = this.find(request.method, request.url);
          if (result  && typeof result[0] == 'function') {
              request.params = {};
              result[1].forEach(function(param){
                request.params[param.name] = param.value;
              });
              return result[0](request, response);
          }
          finalhandler(request, response);
      });

      return httpsServerlisten.apply(this, arguments);
    }
});







module.exports = function(){
  return new http.Server();
};
