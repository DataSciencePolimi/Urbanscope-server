'use strict';
// Load system modules
var path = require( 'path' );

// Load modules
var moment = require( 'moment' );
var _ = require( 'lodash' );

// Load my modules
var cache = require( '../../utils/cache' );
var model = require( '../../model/' );
var logger = require( './' ).logger;

// Constant declaration
var ENDPOINT = path.basename( __filename, '.js' );
var DATE_FORMAT = require( '../' ).DATE_FORMAT;

// Module variables declaration
var log = logger.child( {
  endpoint: ENDPOINT,
} );

// Module functions declaration
function computeScore( post ) {
  var newPost = _.omit( post, 'raw' );
  newPost.score = post.raw.retweet_count + post.raw.favorite_count; //  eslint-disable line camelcase
  return newPost;
}
function parseData( data ) {
  return _.map( data, computeScore );
}
// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function( req, res, next ) {
  var query = res.locals.query;
  var params = res.locals.params;
  var start = params.start;
  var end = params.end;

  // PARAMETERS
  var nils = params.nils;
  var lang = params.lang;
  var limit = params.limit;

  limit = limit || '100';
  limit = Number( limit );

  // Errors
  if( !nils || nils.length===0 ) {
    return next( new Error( 'The "nil_ID" parameter must be an integer' ) );
  }
  if( isNaN( limit ) || limit<0 ) {
    return next( new Error( 'The "limit" parameter must be greater than 0' ) );
  }

  // Set the correct nil filter
  var nil = nils[ 0 ];
  query.nil = nil;

  // Remove the sensitive contents
  query[ 'raw.possibly_sensitive' ] = { $ne: true };
  // and the retweets
  query[ 'raw.retweeted_status' ] = { $exists: false };


  log.trace( { query: query }, 'Final query' );
  // Get the collection to perform the aggregation
  var collection = model.getPostsCollection();
  var cursor = collection.find( query );

  return cursor
  .limit( limit )
  .project( {
    _id: 0,
    id: 1,
    lang: 1,
    date: 1,
    author: 1,
    authorId: 1,
    text: 1,
    'raw.retweet_count': 1,
    'raw.favorite_count': 1,
  } )
  .sort( {
    date: -1
  } )
  .toArray() // Get all the data
  .tap( function() {
    log.trace( 'Closing the cursor' );
    return cursor.close(); // close the cursor
  } )
  .then( parseData )
  .then( function( data ) {

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      nil_ID: nil, // eslint-disable-line camelcase
      lang: lang,
      limit: limit,

      // DATA
      tweets: _.sortByOrder( data, 'score', 'desc' ),

      // Additional params
    };

    return cache.save( response, req, res, next );
  } )
  .catch( next );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78