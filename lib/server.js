var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var net = require('net');

var express = require('express');
var certificate = require('nep-certificate');
var log = require('./util/log');
var util = require('./util/misc');
var middleware = require('./middleware');


/**
 * Proxy Class
 *
 * @param {Object} options
 * port
 * rules
 * timeout
 */
function Proxy(options) {
    this.options = util.merge({
        port: 8989
    }, options);
    this.httpsPort = 0;
    this.express = this.createExpress();

    if (this.options.debug) {
        log.isDebug = true;
    }
}

Proxy.prototype.listen = function() {
    var proxy = this;

    this.httpServer = this.createHttpServer();
    this.httpsServer = this.createHttpsServer(function(){
        proxy.createHttpsChanel();
    });
    
    log.info('Nep started on ' + this.options.port + '!');
};

Proxy.prototype.createExpress = function() {
    var app = express();

    app.set('etag', false);

    app.use(middleware.fixurl);
    app.use(middleware.respond(this));
    app.use(middleware.forward(this));
    return app;
};

Proxy.prototype.createHttpServer = function() {
    var express = this.express;
    var port = this.options.port;
    var proxy = this;

    var server = http.createServer(function(req, res) {
        req.type = 'http';
        proxy.options.filter && proxy.options.filter(req, res);        
        express(req, res);
    });

    server.listen(port);

    return server;
};

Proxy.prototype.createHttpsServer = function(callback) {
    var express = this.express;
    var proxy = this;

    certificate.get('nep.https', function(err, key, cert){
        var server = https.createServer({
            SNICallback : certificate.sni,
            key: key,
            cert: cert
        }, function(req, res) {
            req.type = 'https';
            proxy.options.filter && proxy.options.filter(req, res);        
            express(req, res);
        });
        server.on('listening', function() {
            proxy.httpsPort = server.address().port;
            log.debug('https listen on port: ' + proxy.httpsPort);
        });
        server.listen(0);
        proxy.httpsServer = server;

        callback();
    });    
};

Proxy.prototype.createHttpsChanel = function(argument) {
    var server = this.httpServer;
    var proxy = this;
    server.on('connect', function(req, socket, upgradeHead) {
        var netClient = net.createConnection({
            host: '127.0.0.1',
            port: proxy.httpsPort
        });

        netClient.on('connect', function() {
            log.debug('connect to https server successfully!');
            socket.write("HTTP/1.1 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n");
        });

        socket.on('data', function(chunk) {
            netClient.write(chunk);
        });
        socket.on('end', function() {
            netClient.end();
        });
        socket.on('close', function() {
            netClient.end();
        });
        socket.on('error', function(err) {
            log.error('socket error ' + err.message);
            netClient.end();
        });

        netClient.on('data', function(chunk) {
            socket.write(chunk);
        });
        netClient.on('end', function() {
            socket.end();
        });
        netClient.on('close', function() {
            socket.end();
        });
        netClient.on('error', function(err) {
            log.error('netClient error ' + err.message);
            socket.end();
        });

    });
};

module.exports = Proxy;