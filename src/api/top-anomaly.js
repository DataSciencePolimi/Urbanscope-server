'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let _ = require( 'lodash' );
let moment = require( 'moment' );

// Load my modules
let logger = require( './' );
let getCollection = require( '../model/' ).getCollection;
let getNilAnomalies = require( '../utils/anomalies' ).getNilAnomalies;
let NILS_TO_USE = require( '../utils/anomalies' ).NILS_TO_USE;

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
  let start = qs.startDate;
  let end = qs.endDate;
  let limit = qs.limit;
  let lang = qs.lang;
  log.trace( { qs: qs }, 'Query string' );

  // Default values
  limit = limit || 3;
  lang = lang || 'it';
  start = start || now();
  end = end || now();

  lang = lang.toLowerCase();
  start = moment.utc( start, DATE_FORMAT ).startOf( 'day' ).toDate();
  end = moment.utc( end, DATE_FORMAT ).endOf( 'day' ).toDate();

  log.trace( 'Lang: %s', lang );
  log.trace( 'Limit: %d', limit );
  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );

  let query = {
    source: 'twitter',
    date: {
      $gte: start,
      $lte: end,
    },
  };

  // Narrow by language
  query.lang = {
    $in: [ lang ],
    $ne: 'und',
  };

  query.nil = {
    $in: NILS_TO_USE,
  };

  log.debug( { query: query }, 'Performing the query' );
  let collection = getCollection();
  let data = yield collection.find( query, 'lang nil' );


  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    lang: lang,
  };


  let top = getNilAnomalies( data, lang );

  response.top = _( top )
  .sortByOrder( 'value', false )
  .take( limit )
  .value();

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78