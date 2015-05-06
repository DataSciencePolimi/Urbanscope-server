'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

// Load system modules

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// Load modules

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

// Load my modules

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _model = require('../model/');

'use strict';

// Constant declaration
var ENDPOINT = _path2['default'].basename(__filename, '.js');
var DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
var log = _2['default'].child({ endpoint: ENDPOINT });

// Module functions declaration
function now() {
  return _moment2['default']().format(DATE_FORMAT);
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
exports['default'] = _regeneratorRuntime.mark(function callee$0$0() {
  var qs, start, end, nil, query, collection, tweets, response;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        qs = this.request.query;
        start = qs.startDate;
        end = qs.endDate;
        nil = qs.nil_ID;

        log.trace({ qs: qs }, 'Query string');

        // Default values
        start = start || now();
        end = end || now();

        start = _moment2['default'].utc(start, DATE_FORMAT).startOf('day').toDate();
        end = _moment2['default'].utc(end, DATE_FORMAT).endOf('day').toDate();
        nil = Number(nil);

        log.trace('Start: %s', start);
        log.trace('End: %s', end);
        log.trace('Nil: %s', nil);

        query = {
          source: 'twitter',
          date: {
            $gte: start,
            $lte: end },
          nil: nil
        };

        log.debug({ query: query }, 'Performing the query');
        collection = _model.getCollection();
        context$1$0.next = 18;
        return collection.find(query, 'id lang date author authorId text');

      case 18:
        tweets = context$1$0.sent;
        response = {
          startDate: _moment2['default'](start).format(DATE_FORMAT),
          endDate: _moment2['default'](end).format(DATE_FORMAT),
          tweets: tweets };

        this.body = response;

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports['default'];
// jshint ignore: line

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../api/text-tweets.js.map