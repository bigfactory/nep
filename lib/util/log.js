var chalk = require('chalk');

var TYPE = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

var align = function(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}

var time = function() {
    var date = new Date();
    var hour = align(date.getHours());
    var miniute = align(date.getMinutes());
    var second = align(date.getSeconds());

    return [hour, miniute, second].join(':');
};

var log = {
    print: function(type, msg) {
        var logType = TYPE;
        var msgTpl;

        switch (type) {
            case logType.ERROR:
                msgTpl = chalk.red.bold('[ERROR] ') + time() + ' {{msg}}';
                break;

            case logType.WARN:
                msgTpl = chalk.yellow.bold('[WARN] ') + time() + ' {{msg}}';
                break;

            case logType.INFO:
                msgTpl = chalk.white.bold('[INFO] ') + time() + ' {{msg}}';
                break;

            case logType.DEBUG:
                msgTpl = chalk.green.bold('[DEBUG] ') + time() + ' {{msg}}';
                break;
        }

        msgTpl = msgTpl.replace(/{{msg}}/, msg);

        console.log(msgTpl);
    },

    info: function(msg) {
        log.print(TYPE.INFO, msg);
    },

    warn: function(msg) {
        log.print(TYPE.WARN, msg);
    },

    error: function(msg) {
        log.print(TYPE.ERROR, msg);
    },

    debug: function(msg) {
        if (log.isDebug) {
            log.print(TYPE.DEBUG, msg);
        }
    }
};

var isDebug = false;
Object.defineProperty(log, 'isDebug', {
    set: function(v) {
        isDebug = v;
    },
    get: function() {
        return isDebug;
    }
});
module.exports = log;