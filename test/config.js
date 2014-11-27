module.exports = [
    {
        pattern: 'http://g.assets.daily.taobao.net/',
        responder: 'asset',
        options: {
            //'/buy/base/0.0.1/': '/gitlab/buy/base/build/',
            '/buy/demo/1.0.0/': '/gitlab/buy/demo/build/'
        }
    },
    {
        pattern: 'http://buy.daily.taobao.net/auction/order/confirm_order.htm',
        responder: 'buy',
        options: {
            tpl: '/github/nep/test/res/tpl.html'
        }
    }
];