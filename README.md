## nep
---

Nep is a proxy build with Node.js and Express.


### Installation

```
$ npm install -g nep nep-responder-local
``` 

### Example

Set up config.js

```
module.exports = [
  {
    pattern: 'http://www.my-site.com/',
    responder: 'local',
    options: {
      file: '/www/my-site/'
    }
  }
];
```

Run nep within the same directory of config.js

```
$ nep
```

Change the browser's proxy setting to 127.0.0.1:8989

or just set up the domain in hosts

```
127.0.0.1 www.my-site.com
```

### Responder

Explore exists responders: [npm responder search] 

you may install responders using npm:

```
$ npm install -g nep-responder-web
```

or you can make your own responders as a node module

it is similar with the express middleware:

```
module.exports = function(req, res, next, data){
	var options = data.options;
	var pattern = data.pattern;
	
	res.send('I respond');
};
```

then in the config.js file

```
var myResponder = require('path/to/myResponder');

module.exports = [
  {
    pattern: 'http://www.my-site.com/',
    responder: myResponder,
    options: {
      file: '/www/my-site/'
    }
  }
];

```

[npm responder search]:https://www.npmjs.org/search?q=nep-responder

