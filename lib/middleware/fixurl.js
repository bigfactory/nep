var url = require('url');

module.exports = function(req, res, next){
    var hostArr = req.headers.host.split(':');
    var hostname = hostArr[0];
    var port = hostArr[1];
    
    var parsedUrl = url.parse(req.url, true);

    parsedUrl.protocol = parsedUrl.protocol || req.type + ":";
    parsedUrl.hostname = parsedUrl.hostname || hostname;

    if (!parsedUrl.port && port) {
        parsedUrl.port = port;
    }
    req.url = url.format(parsedUrl);
    next();
};