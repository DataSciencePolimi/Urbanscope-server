'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let _ = require( 'lodash' );
let moment = require( 'moment' );

// Load my modules
let logger = require( './' ).logger;
let getCollection = require( '../model/' ).getCollection;

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = require( './' ).DATE_FORMAT;

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration
function filterTweet( tweet ) {
  return !tweet.raw.possibly_sensitive && !tweet.raw.retweeted_status; // eslint-disable line camelcase
}
function computeScore( tweet ) {
  let newTweet = _.omit( tweet, 'raw' );

  let score = tweet.raw.retweet_count + tweet.raw.favorite_count; //  eslint-disable line camelcase

  newTweet.score = score;
  return newTweet;
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  let query = this.api.query;
  let params = this.api.params;
  let start = params.start;
  let end = params.end;
  let limit = params.limit || 100;
  let nil = params.nil || 1;

  if( isNaN( Number( nil ) ) ) {
    throw new Error( 'The "nil_ID" params must be an integer' );
  }

  query.nil = parseInt( nil, 10 );

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
    nil_ID: Number( nil ), // eslint-disable-line camelcase
    tweets: parsedTweets,
  };

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78