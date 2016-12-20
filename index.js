
//内置模块
var http = require('http');
var https = require('https');
var url = require('url');
var util = require('util');



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
    },
    redirect : function(url){
      this.writeHead(302, {
        'Location': url
      });
      this.end();
    },
    dump : function(mix){
      this.writeHead(200, {'Content-Type': 'text/plain'});
      this.end(util.inspect(mix));
    }
});


//来自浏览器的请求 相当于拓展 request
assign(http.IncomingMessage.prototype, {
    cookies : function(){
        return cookie.parse(this.headers.cookie);
    },
    uri : function(){
        return url.parse(this.url, true);
    },
    isAjax : function(){
      return this.headers['x-requested-with'] == 'XMLHttpRequest';
    }
});



//http 和 https 服务器扩展

var serverMethodExtends = {
  createRouter : function(){
      if(!this.router){
          this.router = new Router();
      }
  },
  add: function(method, rule, handle){
      this.createRouter();
      this.router.add(method, rule, handle);
      return this;
  },
  find: function(method, url){
      this.createRouter();
      return this.router.find(method, url);
  },
  mainHandler: function(){
    this.createRouter();
    this.on('request', function(request, response){
        var self = this;

        var end = finalhandler(request, response, { onerror: function(err, req, res){
          self.emit('error', err, req, res);
        }});

        var result = this.find(request.method, request.url);
        if (result  && typeof result[0] == 'function') {
            request.params = {};
            result[1].forEach(function(param){
              request.params[param.name] = param.value;
            });
            return result[0].call(this, request, response, end);
        }else{
          end();
        }
    });
  }
};

assign(http.Server.prototype, serverMethodExtends);
assign(https.Server.prototype, serverMethodExtends);




//router methods
//get post put ...

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


//rewrite listen

var httpServerlisten = http.Server.prototype.listen;
var httpsServerlisten = https.Server.prototype.listen;

http.Server.prototype.listen = function(){
  this.emit('listen');
  this.mainHandler();
  return httpServerlisten.apply(this, arguments);
};
https.Server.prototype.listen = function(){
  this.emit('listen');
  this.mainHandler();
  return httpsServerlisten.apply(this, arguments);
};






module.exports = function(){
  return new http.Server();
};
