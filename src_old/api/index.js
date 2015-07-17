'use strict';
// Load system modules

// Load modules
let moment = require( 'moment' );
let bunyan = require( 'bunyan' );
let _ = require( 'lodash' );

// Load my modules

// Constant declaration
const DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
let logger = bunyan.createLogger( {
  name: 'api',
  level: 'trace',
} );


// Module functions declaration
function now() {
  return moment().format( DATE_FORMAT );
}
function* callsApiMiddleware( next ) {
  let log = logger.child( { component: 'calls params' } );
  // Get query parameters
  let qs = this.request.query;
  let start = qs.startDate;
  let end = qs.endDate;
  let nil = qs.nil_ID; // eslint-disable-line camelcase
  log.trace( { qs: qs }, 'Query string' );

  // Default values
  start = start || now();
  end = end || now();

  start = moment.utc( start, DATE_FORMAT ).startOf( 'day' ).toDate();
  end = moment.utc( end, DATE_FORMAT ).endOf( 'day' ).toDate();

  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );
  log.trace( 'Nil: %s', nil );

  let query = {
    date: {
      $gte: start,
      $lte: end,
    },
  };

  // Narrow by NIL (if present)
  if( nil ) {
    let nilList = _( nil.split( ',' ) )
    .map( Number )
    .filter( function( num ) {
      return num>0;
    } )
    .value();

    query.nil = {
      $in: nilList,
    };
  }

  log.debug( { query: query }, 'Performing the query' );
  this.api = {
    params: {
      start: start,
      end: end,
      nil: nil,
    },
    query: query
  };

  yield next;
}
function* tweetsApiMiddleware( next ) {
  let log = logger.child( { component: 'tweets params' } );
  // Get query parameters
  let qs = this.request.query;
  let start = qs.startDate;
  let end = qs.endDate;
  let lang = qs.lang;
  let limit = qs.limit;
  let nil = qs.nil_ID; // eslint-disable-line camelcase
  log.trace( { qs: qs }, 'Query string' );

  // Default values
  lang = lang || 'it';
  start = start || now();
  end = end || now();
  // limit = limit || 3;

  lang = lang.toLowerCase();
  start = moment.utc( start, DATE_FORMAT ).startOf( 'day' ).toDate();
  end = moment.utc( end, DATE_FORMAT ).endOf( 'day' ).toDate();
  // limit = Number( limit );

  log.trace( 'Lang: %s', lang );
  log.trace( 'Limit: %d', limit );
  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );
  log.trace( 'Nil: %s', nil );

  let query = {
    source: 'twitter',
    date: {
      $gte: start,
      $lte: end,
    },
  };

  if( lang==='other' ) {
    query.lang = {
      $nin: [ 'it', 'en', 'und' ],
    };
  } else {
    query.lang = lang;
  }

  // Narrow by NIL (if present)
  if( nil && isNaN( Number( nil ) ) ) {
    let nilList = _( nil.split( ',' ) )
    .map( function( num ) {
      logger.trace( 'Nil %s', num );
      return parseInt( num, 10 );
    } )
    .filter( function( num ) {
      return num>0;
    } )
    .value();

    query.nil = {
      $in: nilList,
    };
  }

  log.debug( { query: query }, 'Performing the query' );
  this.api = {
    params: {
      start: start,
      end: end,
      lang: lang,
      limit: limit,
      nil: nil,
    },
    query: query
  };

  yield next;
}
// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports.logger = logger;
module.exports.tweetsApiMiddleware = tweetsApiMiddleware;
module.exports.callsApiMiddleware = callsApiMiddleware;
module.exports.DATE_FORMAT = DATE_FORMAT;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78