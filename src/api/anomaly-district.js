'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let moment = require( 'moment' );

// Load my modules
let logger = require( './' ).logger;
let getCollection = require( '../model/' ).getCollection;
let getNilAnomalies = require( '../utils/anomalies' ).getNilAnomalies;

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
module.exports = function*() {
  let query = this.api.query;
  let params = this.api.params;
  let start = params.start;
  let end = params.end;
  let lang = params.lang;

  let collection = getCollection();
  let data = yield collection.find( query, 'lang nil' );

  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    lang: lang,
    nils: getNilAnomalies( data, lang ),
  };

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78