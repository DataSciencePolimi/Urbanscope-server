'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

// Load system modules
var path = require('path');

// Load modules
var moment = require('moment');
var _ = require('lodash');

// Load my modules
var logger = require('./');
var getCollection = require('../model/').getCollection;
// import nils from '../../config/nils.json';

// Constant declaration
var ENDPOINT = path.basename(__filename, '.js');
var DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
var log = logger.child({ endpoint: ENDPOINT });

// Module functions declaration
function now() {
  return moment().format(DATE_FORMAT);
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = _regeneratorRuntime.mark(function callee$0$0() {
  var qs, lang, start, end, nil, query, nilList, collection, data, response;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        qs = this.request.query;
        lang = qs.lang;
        start = qs.startDate;
        end = qs.endDate;
        nil = qs.nil_ID;
        // jshint ignore: line
        log.trace({ qs: qs }, 'Query string');

        // Default values
        lang = lang || 'it';
        start = start || now();
        end = end || now();

        lang = lang.toLowerCase();
        start = moment(start, DATE_FORMAT).startOf('day').toDate();
        end = moment(end, DATE_FORMAT).endOf('day').toDate();

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
            $nin: ['it', 'en', 'und'] };
        }

        // Narrow by NIL (if present)
        if (nil) {
          nilList = nil.split(',').map(Number);

          query.nil = {
            $in: nilList };
        }

        log.debug({ query: query }, 'Performing the query');
        collection = getCollection();
        context$1$0.next = 23;
        return collection.find(query, 'date lang id nil');

      case 23:
        data = context$1$0.sent;
        response = {
          startDate: moment(start).format(DATE_FORMAT),
          endDate: moment(end).format(DATE_FORMAT),
          lang: lang };

        response.nils = _(data).groupBy('nil').map(function (tweets, nil) {
          var langs = _.countBy(tweets, 'lang');
          var value = tweets.length;

          return {
            langs: langs,
            nil: Number(nil), // Force conversion
            value: value };
        }).value();

        this.body = response;

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../api/district-tweets.js.map