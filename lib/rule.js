var chalk = require('chalk');
var log = require('./util/log');
var env = require('./util/env');

var pkgprefix = require('../package.json').pkgprefix;
var counter = 0;


function Manager() {
    this.items = {};
    this.order = [];
}


/*
 * 增加规则
 */
Manager.prototype.add = function(rule) {
    var id = counter++;
    var item = new RuleItem(id, rule);

    this.items[id] = item;
    this.order.push(id);
};


/*
 * 删除规则
 */
Manager.prototype.remove = function(id) {
    var order = [];
    this.items[id] = null;

    for(var i = 0, len = this.order.length; i < len; i++){
        if(this.order[i] == id){
            continue;
        }
        order.push(this.order[i]);
    }

    this.order = order;
};


/*
 * 修改规则
 */
Manager.prototype.set = function(id, rule) {
    this.items[id].update(rule);
};


/*
 * 查询规则
 */
Manager.prototype.get = function(id) {
    return this.items[id];
};


/*
 * 获取顺序排列的规则列表
 */
Manager.prototype.getOrderRules = function(){
    var ret = [];
    for(var i = 0, len = this.order.length; i < len; i++){
        ret.push(this.items[this.order[i]]);
    }
    return ret;
};



/*
 * 规则封装
 */
function RuleItem(id, rule) {
    this.id = id;
    this.rule = rule;
    this.cursor = null;
}


/*
 * 更新规则
 */
RuleItem.prototype.update = function(rule) {
    this.rule = rule;
};


RuleItem.prototype.setCursor = function(cursor){
    this.cursor = cursor;
};



/*
 * 匹配请求
 */
RuleItem.prototype.match = function(req, res) {
    var pattern = this.rule.pattern;
    var url = req.url;
    var ret;

    if (typeof pattern == 'string') {
        ret = url.indexOf(pattern) >= 0;
    }
    else if (typeof pattern == 'function') {
        ret = pattern(url, pattern, req);
    }
    else if (pattern instanceof RegExp) {
        ret = pattern.test(url);
    }

    if(ret){
        addRequestFlag(req, 'match', this.cursor)
    }

    return ret;
};


/*
 * 执行预处理操作
 */
RuleItem.prototype.filter = function(req, res, next, method) {
    var rule = this.rule;
    var filter = rule.filter;
    var oriName = filter;
    var filterModule;

    if (!filter) {
        next();
        return;
    }

    method.options = rule.options;
    method.pattern = rule.pattern;

    if (typeof filter == 'string') {
        filter = pkgprefix + '-filter-' + filter;
        filterModule = env.lookup(filter);
        if (filterModule) {
            log.debug('filter with: ' + filter);
            addRequestFlag(req, 'filter', oriName);
            filterModule(req, res, next, method);
        }
        else {
            var msg = 'filter not found : ' + filter;
            log.error(msg);
            res.status(500).send(msg);
        }
    }
    else if (typeof filter == 'function') {
        addRequestFlag(req, 'filter', 'function:'+this.cursor);
        filter(req, res, next, method);
    }
    else {
        var msg = 'invalid filter : ' + filter;
        log.warn(msg);
        res.status(500).send(msg);
    }
};


/*
 * 执行响应
 */
RuleItem.prototype.respond = function(req, res, next, method) {
    var rule = this.rule;
    var responder = rule.responder;
    var oriName = responder;
    var responderModule;

    if (!responder) {
        next();
        return;
    }
    
    method.options = rule.options;
    method.pattern = rule.pattern;

    if (typeof responder == 'string') {
        responder = pkgprefix + '-responder-' + responder;
        responderModule = env.lookup(responder);
        if (responderModule) {
            log.debug(chalk.cyan('[RESPOND]: ') + responder);
            addRequestFlag(req, 'responder', oriName);
            responderModule(req, res, next, method);
        }
        else {
            var msg = 'responder not found : ' + responder;
            log.error(msg);
            res.status(500).send(msg);
        }
    }
    else if (typeof responder == 'function') {
        log.debug('respond with function');
        addRequestFlag(req, 'responder', 'function:'+this.cursor);
        responder(req, res, next, method);
    }
    else {
        log.warn('invalid responder : ' + responder);
        next();
    }
};


function addRequestFlag(req, group, name){
    req.nnflag = req.nnflag || {};
    req.nnflag[group] = req.nnflag[group] || [];
    req.nnflag[group].push(name);
}

exports.Manager = Manager;