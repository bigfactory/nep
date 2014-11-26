

module.exports = [{
    pattern: 'http://g.assets.daily.taobao.net/',
    filter: 'cleanmin',
    responder: 'asset',
    options: {
        '/buy/base/0.0.1/': '/gitlab/buy/base/build/',
        '/buy/demo/1.0.0/': '/gitlab/buy/demo/build/'
    }
}];