var chalk = require('chalk');
var log = require('../util/log');
var flow = require('../flow');


module.exports = function(proxy){
    return new Responder(proxy).get();
};


function Responder(proxy) {
    this.proxy = proxy;
}


Responder.prototype.get = function(){
    var proxy = this.proxy;

    return function(req, res, next){
        var rules = proxy.router.getOrderRules();

        var instance = flow.create(req, res, next, rules);
        instance.go();
    };
};


