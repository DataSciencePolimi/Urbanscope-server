'use strict';
// Load system modules
var path = require( 'path' );

// Load modules
var moment = require( 'moment' );
var _ = require( 'lodash' );

// Load my modules
var cache = require( '../../utils/cache' );
var logger = require( './' ).logger;
var anomalies = require( '../../utils/anomalies' );
var nils = require( '../../../config/nils.json' );

// Constant declaration
var ENDPOINT = path.basename( __filename, '.js' );
var DATE_FORMAT = require( '../' ).DATE_FORMAT;

// Module variables declaration
var log = logger.child( {
  endpoint: ENDPOINT,
} );

// Module functions declaration

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
  var lang = params.lang;
  query.lang = { $ne: 'und' };

  // Only use suitable nils
  query.nil = { $ne: null };

  return anomalies
  .getAnomaliesForLanguage( query, lang )
  .then( function( data ) {
    log.trace( 'Got anomalies, sorting by nil and sending the response' );


    var aboveThreshold = _( data )
    .map( 'nil_id' )
    .sortByOrder( _.identity, 'asc' )
    .value();

    var belowThreshold = _( nils )
    .map( 'properties.ID_NIL' )
    .difference( aboveThreshold )
    .value();

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      lang: lang,
      nonTransparent: aboveThreshold,

      // Additional params
      belowThreshold: belowThreshold,
      counts: _.countBy( data, 'type' ),

      // DATA
      nils: _.sortByOrder( data, 'nil_id', 'asc' ),

    };

    return cache.save( response, req, res, next );
  } )
  .catch( next );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78