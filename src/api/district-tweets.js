'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let moment = require( 'moment' );
let _ = require( 'lodash' );

// Load my modules
let logger = require(  './' );
let getCollection = require( '../model/' ).getCollection;
// import nils from '../../config/nils.json';

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration
function now() {
  return moment().format( DATE_FORMAT );
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  let qs = this.request.query;
  let lang = qs.lang;
  let start = qs.startDate;
  let end = qs.endDate;
  let nil = qs.nil_ID; // jshint ignore: line
  log.trace( { qs: qs }, 'Query string' );

  // Default values
  lang = lang || 'it';
  start = start || now();
  end = end || now();

  lang = lang.toLowerCase();
  start = moment( start, DATE_FORMAT ).startOf( 'day' ).toDate();
  end = moment( end, DATE_FORMAT ).endOf( 'day' ).toDate();

  log.trace( 'Lang: %s', lang );
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

  // Narrow by language
  if( lang==='it' ) {
    query.lang = 'it';
  } else if( lang==='en' ) {
    query.lang = 'en';
  } else {
    lang = 'other';
    query.lang = {
      $nin: [ 'it', 'en', 'und' ],
    };
  }

  // Narrow by NIL (if present)
  if( nil ) {
    let nilList = nil.split( ',' ).map( Number );

    query.nil = {
      $in: nilList,
    };
  }


  log.debug( { query }, 'Performing the query' );
  let collection = getCollection();
  let data = yield collection.find( query, 'date lang id nil' );

  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    lang: lang,
  };

  response.nils = _( data )
  .groupBy( 'nil' )
  .map( function( tweets, nil ) {
    let langs = _.countBy( tweets, 'lang' );
    let value = tweets.length;

    return {
      langs: langs,
      nil: Number( nil ), // Force conversion
      value: value,
    };
  } )
  .value();

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78