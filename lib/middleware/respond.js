var log = require('../util/log');
var env = require('../util/env');
var net = require('../util/net');


var pkgprefix = require('../../package.json').pkgprefix;

module.exports = function(proxy){
    return new Responder(proxy).get();
};

function Responder(proxy) {
    this.proxy = proxy;
};

Responder.prototype.get = function() {
    var proxy = this.proxy;

    return function(req, res, next) {
        var worker, rule, sdk;
        var rules = proxy.options.rules;
        var hit = false;

        if (!rules) {

            next();
            return;
        }


        for (var i = 0, len = rules.length; i < len; i++) {
            log.debug('begin match rules: ' + i);
            rule = rules[i];
            sdk = {
                log: log,
                options: rule.options,
                pattern: rule.pattern
            };

            worker = new Worker(proxy, rule, sdk);

            if (worker.match(req)) {
                worker.filter(req, res, function() {
                    worker.respond(req, res, next)
                });
                hit = true;
            }
        }

        if(!hit){
            next();
        }
    };
};

Responder.prototype.reload = function(proxy) {
    this.proxy = proxy;
};


function Worker(proxy, rule, sdk) {
    this.proxy = proxy;
    this.rule = rule;
    this.sdk = sdk;
}

Worker.prototype.match = function(req) {
    var pattern = this.rule.pattern;
    var url = req.url;

    if (typeof pattern == 'string') {
        return url.indexOf(pattern) >= 0;
    }
    else if (typeof pattern == 'function') {
        return pattern(url, pattern, req);
    }
    else if (pattern instanceof RegExp) {
        return pattern.test(url);
    }
};

Worker.prototype.filter = function(req, res, next) {
    var rule = this.rule;
    var filter = rule.filter;
    var sdk = this.sdk;

    if (!filter) {
        next();
    }
    else if (typeof filter == 'string') {
        filter = pkgprefix + '-filter-' + filter;
        if (env.lookup(filter)) {
            require(filter)(req, res, next, sdk);
        }
        else {
            var msg = 'filter not found : ' + filter;
            log.error(msg);
            res.status(500).send(msg);
        }
    }
    else if (typeof filter == 'function') {
        filter(req, res, next, sdk);
    }
    else {
        var msg = 'invalid filter : ' + filter;
        log.warn(msg);
        res.status(500).send(msg);
    }
};

Worker.prototype.respond = function(req, res, next) {
    var rule = this.rule;
    var responder = rule.responder;
    var sdk = this.sdk;

    if (!responder) {
        next();
    }
    else if (typeof responder == 'string') {
        responder = pkgprefix + '-responder-' + responder;
        if (env.lookup(responder)) {
            require(responder)(req, res, next, sdk);
        }
        else {
            var msg = 'responder not found : ' + responder;
            log.error(msg);
            res.status(500).send(msg);
        }
    }
    else if (typeof responder == 'function') {
        responder(req, res, next, sdk);
    }
    else {
        log.warn('invalid responder : ' + responder);
        next();
    }

};