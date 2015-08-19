
var log = require('./util/log');


exports.create = function(req, res, next, rules){
    return new Flow(req, res, next, rules);
};


/*
 * 请求匹配响应流程
 */
function Flow(req, res, next, rules){
    this.req = req;
    this.res = res;
    this.next = next;
    this.rules = rules;
    this.cursor = -1;

    var flow = this;
    
    res.on('end', function(){
        flow.end();
    });
}


/*
 * 运行下一流程
 */
Flow.prototype.go = function(){
    this.cursor++;
    if(this.cursor >= this.rules.length){
        this.end();
        this.next();
        this.next = null;
        return;
    }

    var rule = this.rules[this.cursor];
    var flow = this;
    var cursor = this.cursor;
    var api;

    api = {
        log: log,
        skip: function(){
            flow.go();
        }
    };

    rule.setCursor(cursor);

    if(rule.match(flow.req, flow.res)){
        rule.filter(flow.req, flow.res, function(){
            /*
             * 在filter中执行了skip跳转了当前流程会导致cursor != flow.cursor
             */
            if(cursor != flow.cursor){
                return;
            }
            rule.respond(flow.req, flow.res, flow.next, api);
        }, api);
    }
    else{
        flow.go();
    }
};


/*
 * 流程结束
 */
Flow.prototype.end = function(){
    this.req = null;
    this.res = null;
    this.rules = null;
    this.cursor = -1;
};