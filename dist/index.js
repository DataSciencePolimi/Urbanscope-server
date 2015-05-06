
// Load system modules

// Load modules
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaCors = require('koa-cors');

var _koaCors2 = _interopRequireDefault(_koaCors);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

// Load my modules

var _model = require('./model/');

var _configServerJson = require('../config/server.json');

var _configServerJson2 = _interopRequireDefault(_configServerJson);

var _apiDistrictAnomaly = require('./api/district-anomaly');

var _apiDistrictAnomaly2 = _interopRequireDefault(_apiDistrictAnomaly);

var _apiTopAnomaly = require('./api/top-anomaly');

var _apiTopAnomaly2 = _interopRequireDefault(_apiTopAnomaly);

var _apiDistrictTweets = require('./api/district-tweets');

var _apiDistrictTweets2 = _interopRequireDefault(_apiDistrictTweets);

var _apiTimelineTweets = require('./api/timeline-tweets');

var _apiTimelineTweets2 = _interopRequireDefault(_apiTimelineTweets);

var _apiTextTweets = require('./api/text-tweets');

var _apiTextTweets2 = _interopRequireDefault(_apiTextTweets);

'use strict';

// Constant declaration

// Module variables declaration
var app = _koa2['default']();
var log = _bunyan2['default'].createLogger({
  name: 'server',
  level: 'trace' });

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
app.name = 'UrbanScope server';
app.proxy = true;

// Entry point
_co2['default'](_regeneratorRuntime.mark(function callee$0$0() {
  var router, port;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        // Setup mongo
        _model.open();

        // Middlewares
        app.use(_koaCors2['default']());

        router = new _koaRouter2['default'](app);

        router.get('/anomaly/district', _apiDistrictAnomaly2['default']);
        router.get('/anomaly/top', _apiTopAnomaly2['default']);
        router.get('/tweets/district', _apiDistrictTweets2['default']);
        router.get('/tweets/timeline', _apiTimelineTweets2['default']);
        router.get('/tweets/text', _apiTextTweets2['default']);

        // Add the router to the Koa Application
        app.use(router.routes());
        app.use(router.allowedMethods());

        port = _configServerJson2['default'].port;

        log.debug('Start server @ port %d', port);
        app.listen(port);

      case 13:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}))['catch'](function (err) {
  log.fatal(err, 'NUOOOOOOOOO');
  _model.close();
  process.exit(1);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
// Add endpoints
// Start server
//# sourceMappingURL=index.js.map