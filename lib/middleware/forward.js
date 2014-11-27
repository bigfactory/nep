var Buffer = require('buffer').Buffer;
var request = require('nep-request');
var log = require('../util/log');



module.exports = function(proxy) {
    return function(req, res, next) {
        /**
         * Forward the request directly
         */
        var url = req.url;
        var options = {
            url: url,
            method: req.method,
            headers: req.headers,
            timeout: proxy.options.timeout
        }
        var buffers = [];

        log.debug('forward: ' + url);

        if (req.method === 'POST') {
            req.on('data', function(chunk) {
                buffers.push(chunk);
            });

            req.on('end', function() {
                options.data = Buffer.concat(buffers);
                request(options, function(err, data, proxyRes) {
                    _forwardHandler(err, data, proxyRes, res);
                });
            });
        }
        else {
            request(options, function(err, data, proxyRes) {
                _forwardHandler(err, data, proxyRes, res)
            });
        }

        function _forwardHandler(err, data, proxyRes, res) {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.write(data);
            res.end();
        }
    };
};