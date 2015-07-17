'use strict';
// Load system modules
var path = require( 'path' );

// Load modules
var moment = require( 'moment' );
var _ = require( 'lodash' );

// Load my modules
var model = require( '../../model/' );
var logger = require( '../' ).logger;

// Constant declaration
var ENDPOINT = path.basename( __filename, '.js' );
var DATE_FORMAT = require( '../' ).DATE_FORMAT;

// Module variables declaration
var log = logger.child( {
  endpoint: ENDPOINT,
} );

// Module functions declaration
function parseData( nilData ) {
  delete nilData._id; // eslint-disable-line no-underscore-dangle

  var year = nilData.date.getFullYear();
  var month = nilData.date.getMonth()+1;
  var day = nilData.date.getDate();
  var date = ''+year;
  date += '-'+( month>9? month : '0'+month );
  date += '-'+( day>9? day : '0'+day );


  return {
    date: date,
    in: nilData.callIn,
    out: nilData.callOut,
    total: nilData.callOut + nilData.callIn,
    country: nilData.country,
  };
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
  var nils = params.nils;

  // PARAMETERS
  nils = nils || [ 1 ];

  var limit = req.query.limit;
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


  // Get the collection to perform the aggregation
  var collection = model.getCallsCollection();
  var cursor = collection.find( query );

  return cursor
  .limit( limit )
  .sort( {
    date: -1,
  } )
  .toArray() // Get all the data
  .map( parseData )
  .tap( function() {
    log.trace( 'Closing the cursor' );
    return cursor.close(); // close the cursor
  } )
  .then( function( data ) {

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      nil_ID: nil, // eslint-disable-line camelcase
      limit: limit,

      // DATA
      calls: _.sortByOrder( data, 'date' , 'asc' ),
    };

    return res.json( response );
  })
  .catch( next );


};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78