var Proxy = require('./lib/server');
var env = require('./lib/util/env');
var log = require('./lib/util/log');
var conf = require('./package.json');

exports.create = function(options) {
    exports.validate(options.rules);

    var proxy = new Proxy(options);
    proxy.listen();
    return proxy;
};


exports.validate = function(rules){
    if(!rules){
        return;
    }
    rules.forEach(function(rule, i){
        if(typeof rule.filter == 'string'){
            if(!env.lookup(conf.pkgprefix, 'filter', rule.filter)){
                log.error('filter not found : ' + rule.filter);
            }
        }
        if(typeof rule.responder == 'string'){
            if(!env.lookup(conf.pkgprefix, 'responder', rule.responder)){
                log.error('responder not found : ' + rule.responder);
            }
        }
    });
}