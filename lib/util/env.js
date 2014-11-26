var util = require('./misc');

exports.lookup = function(prefix, name) {
    var name = util.toArray(arguments).join('-');

    try {
        require.resolve(name);
    }
    catch (e) {
        return false;
    }

    return true;
};