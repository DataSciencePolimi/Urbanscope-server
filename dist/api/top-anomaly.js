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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

// Load my modules

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

var _model = require('../model/');

var _utilsAnomalies = require('../utils/anomalies');

// Constant declaration
var ENDPOINT = _path2['default'].basename(__filename, '.js');
var DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
var log = _3['default'].child({ endpoint: ENDPOINT });

// Module functions declaration
function now() {
  return (0, _moment2['default'])().format(DATE_FORMAT);
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
exports['default'] = _regeneratorRuntime.mark(function callee$0$0() {
  var qs, lang, start, end, limit, query, collection, data, response, top;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        qs = this.request.query;
        lang = qs.lang;
        start = qs.startDate;
        end = qs.endDate;
        limit = qs.limit;

        log.trace({ qs: qs }, 'Query string');

        // Default values
        limit = limit || 3;
        lang = lang || 'it';
        start = start || now();
        end = end || now();

        lang = lang.toLowerCase();
        start = _moment2['default'].utc(start, DATE_FORMAT).startOf('day').toDate();
        end = _moment2['default'].utc(end, DATE_FORMAT).endOf('day').toDate();

        log.trace('Lang: %s', lang);
        log.trace('Limit: %d', limit);
        log.trace('Start: %s', start);
        log.trace('End: %s', end);

        query = {
          source: 'twitter',
          date: {
            $gte: start,
            $lte: end } };

        // Narrow by language
        query.lang = {
          $ne: 'und' };

        query.nil = {
          $in: _utilsAnomalies.NILS_TO_USE };

        log.debug({ query: query }, 'Performing the query');
        collection = (0, _model.getCollection)();
        context$1$0.next = 24;
        return collection.find(query, 'lang nil');

      case 24:
        data = context$1$0.sent;
        response = {
          startDate: (0, _moment2['default'])(start).format(DATE_FORMAT),
          endDate: (0, _moment2['default'])(end).format(DATE_FORMAT),
          lang: lang };
        top = (0, _utilsAnomalies.getNilAnomalies)(data, lang);

        response.top = (0, _lodash2['default'])(top).sortByOrder('value', false).take(limit).value();

        this.body = response;

      case 29:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports['default'];

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../api/top-anomaly.js.map