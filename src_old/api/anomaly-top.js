'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let moment = require( 'moment' );
let _ = require( 'lodash' );

// Load my modules
let logger = require( './' ).logger;
let getCollection = require( '../model/' ).getCollection;
let getNilAnomalies = require( '../utils/anomalies' ).getNilAnomalies;
let getNonGrayNils = require( '../utils/anomalies' ).getNonGrayNils;

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = require( './' ).DATE_FORMAT;

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration


// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  let query = this.api.query;
  let params = this.api.params;
  let start = params.start;
  let end = params.end;
  let lang = params.lang;
  let limit = params.limit || 3;


  limit = Number( limit );
  // Remove the lang filter
  delete query.lang;

  log.trace( { query: query }, 'Final query' );
  let collection = getCollection();
  let data = yield collection.find( query, 'lang nil' );


  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    lang: lang,
    nonTransparent: getNonGrayNils( data ),
  };


  let top = getNilAnomalies( data, lang );

  response.top = _( top )
  .sortByOrder( 'value', false )
  .take( limit )
  .value();

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78