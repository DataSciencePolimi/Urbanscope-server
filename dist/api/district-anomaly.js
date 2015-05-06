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

var _configNilsJson = require('../../config/nils.json');

var _configNilsJson2 = _interopRequireDefault(_configNilsJson);

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
  var qs, lang, start, end, nil, query, nilList;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        qs = this.request.query;
        lang = qs.lang;
        start = qs.startDate;
        end = qs.endDate;
        nil = qs.nil_ID;

        log.trace({ qs: qs }, 'Query string');

        // Default values
        lang = lang || 'it';
        start = start || now();
        end = end || now();

        lang = lang.toLowerCase();
        start = _moment2['default'].utc(start, DATE_FORMAT).startOf('day').toDate();
        end = _moment2['default'].utc(end, DATE_FORMAT).endOf('day').toDate();

        log.trace('Lang: %s', lang);
        log.trace('Start: %s', start);
        log.trace('End: %s', end);
        log.trace('Nil: %s', nil);

        query = {
          source: 'twitter',
          date: {
            $gte: start,
            $lte: end } };

        // Narrow by language
        if (lang === 'it') {
          query.lang = 'it';
        } else if (lang === 'en') {
          query.lang = 'en';
        } else if (lang === 'other') {
          query.lang = {
            $nin: ['it', 'en'] };
        }

        // Narrow by NIL (if present)
        if (nil) {
          nilList = nil.split(',').map(function (nil) {
            return Number(nil);
          });

          query.nil = {
            $in: nilList };
        }

        this.status = 501;
        this.body = 'Not yet implemented';

        /*
        log.debug( { query }, 'Performing the query' );
        let collection = getCollection();
        let data = yield collection.find( query, '-raw' );
        
          let response = {
          startDate: moment( start ).format( DATE_FORMAT ),
          endDate: moment( end ).format( DATE_FORMAT ),
          lang: lang,
        };
        let nils = [];
          response.nils = nils;
          response.nils = nils;
        this.body = response;
        */

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports['default'];
// jshint ignore: line

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../api/district-anomaly.js.map