'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

// Load system modules
var path = require('path');

// Load modules
var _ = require('lodash');
var moment = require('moment');

// Load my modules
var logger = require('./');
var getCollection = require('../model/').getCollection;

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
  var qs, lang, start, end, query, collection, data, response, timeline;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        qs = this.request.query;
        lang = qs.lang;
        start = qs.startDate;
        end = qs.endDate;

        log.trace({ qs: qs }, 'Query string');

        // Default values
        lang = lang || 'it';
        start = start || now();
        end = end || now();

        lang = lang.toLowerCase();
        start = moment.utc(start, DATE_FORMAT).startOf('day').toDate();
        end = moment.utc(end, DATE_FORMAT).endOf('day').toDate();

        log.trace('Lang: %s', lang);
        log.trace('Start: %s', start);
        log.trace('End: %s', end);

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

        log.debug({ query: query }, 'Performing the query');
        collection = getCollection();
        context$1$0.next = 20;
        return collection.find(query, 'date lang');

      case 20:
        data = context$1$0.sent;
        response = {
          startDate: moment(start).format(DATE_FORMAT),
          endDate: moment(end).format(DATE_FORMAT),
          lang: lang };
        timeline = _(data).groupBy(function (post) {
          return moment(post.date).format('YYYY-MM');
        }).map(function (posts, date) {
          return {
            date: date,
            value: posts.length };
        }).value();

        response.timeline = timeline;
        this.body = response;

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../api/timeline-tweets.js.map