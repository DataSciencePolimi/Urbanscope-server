'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

// Load system modules

// Load modules
var co = require('co');
var koa = require('koa');
var Router = require('koa-router');
var cors = require('koa-cors');
var bunyan = require('bunyan');

// Load my modules
var serverConfig = require('../config/server.json');
var districtAnomaly = require('./api/district-anomaly');
var topAnomaly = require('./api/top-anomaly');
var districtTweets = require('./api/district-tweets');
var timelineTweets = require('./api/timeline-tweets');
var textTweets = require('./api/text-tweets');
var openMongo = require('./model/').open;
var closeMongo = require('./model/').close;

// Constant declaration

// Module variables declaration
var app = koa();
var log = bunyan.createLogger({
  name: 'server',
  level: 'trace' });

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
app.name = 'UrbanScope server';
app.proxy = true;

// Entry point
co(_regeneratorRuntime.mark(function callee$0$0() {
  var router, port;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        // Setup mongo
        openMongo();

        // Middlewares
        app.use(cors());

        router = new Router(app);

        router.get('/anomaly/district', districtAnomaly);
        router.get('/anomaly/top', topAnomaly);
        router.get('/tweets/district', districtTweets);
        router.get('/tweets/timeline', timelineTweets);
        router.get('/tweets/text', textTweets);

        // Add the router to the Koa Application
        app.use(router.routes());
        app.use(router.allowedMethods());

        port = serverConfig.port;

        log.debug('Start server @ port %d', port);
        app.listen(port);

      case 13:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}))['catch'](function (err) {
  log.fatal(err, 'NUOOOOOOOOO');
  closeMongo();
  process.exit(1);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
// Add endpoints
// Start server
//# sourceMappingURL=index.js.map