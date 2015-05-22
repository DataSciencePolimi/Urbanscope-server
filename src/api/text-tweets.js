'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let _ = require( 'lodash' );
let moment = require( 'moment' );

// Load my modules
let logger = require( './' );
let getCollection = require( '../model/' ).getCollection;

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration
function now() {
  return moment().format( DATE_FORMAT );
}
function filterTweet( tweet ) {
  return !tweet.raw.possibly_sensitive; //jshint ignore:line
}
function computeScore( tweet ) {
  let newTweet = _.omit( tweet, 'raw' );

  let score = tweet.raw.retweet_count + tweet.raw.favorite_count; // jshint ignore: line

  newTweet.score = score;
  return newTweet;
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  let qs = this.request.query;
  let start = qs.startDate;
  let end = qs.endDate;
  let nil = qs.nil_ID; // jshint ignore: line
  let lang = qs.lang;
  let limit = qs.limit;
  log.trace( { qs: qs }, 'Query string' );

  // Default values
  lang = lang || 'it';
  limit = limit || 100;
  start = start || now();
  end = end || now();

  start = moment( start, DATE_FORMAT ).startOf( 'day' ).utc().toDate();
  end = moment( end, DATE_FORMAT ).endOf( 'day' ).utc().toDate();
  nil = Number( nil );

  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );
  log.trace( 'Nil: %s', nil );

  let query = {
    source: 'twitter',
    date: {
      $gte: start,
      $lte: end,
    },
    nil: nil,
    lang: lang,
  };

  log.debug( { query: query }, 'Performing the query' );
  let collection = getCollection();
  let tweets = yield collection.find( query, 'id lang date author authorId text raw' );

  let parsedTweets = _( tweets )
  .filter( filterTweet )
  .map( computeScore )
  .sortByOrder( 'score', false )
  .take( limit )
  .value();

  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    tweets: parsedTweets,
  };

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78