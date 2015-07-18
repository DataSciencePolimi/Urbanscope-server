'use strict';
// Load system modules
var path = require( 'path' );

// Load modules
var moment = require( 'moment' );
var _ = require( 'lodash' );

// Load my modules
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
function getStringMonth( document ) {
  var date = document.date;
  var year = date.getFullYear();
  var month = date.getMonth()+1;

  var myDate = ''+year;
  myDate += '-';
  myDate += ''+( month>9? month: '0'+month );

  return myDate;
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
  var lang = params.lang;

  // Add nil filter
  query.nil = { $ne: null };


  log.trace( { query: query }, 'Final query' );
  // Get the collection to perform the aggregation
  var collection = model.getPostsCollection();
  var cursor = collection.find( query );

  var timeline = {};
  function sendResponse() {
    timeline = _.map( timeline, function( value, strDate ) {
      return {
        value: value,
        date: strDate,
      };
    } );

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      lang: lang,

      // DATA
      timeline: timeline,

      // Additional params
    };

    return res.json( response );
  }
  function closeCursor() {
    log.trace( 'Closing the cursor' );
    cursor
    .close() // close the cursor
    .then( sendResponse )
    .catch( next );
  }
  return cursor
  .project( {
    date: 1,
  } )
  .stream( {
    transform: getStringMonth
  } )
  .on( 'data', function( date ) {
    timeline[ date ] = timeline[ date ] || 0;
    timeline[ date ] += 1;
  } )
  .once( 'end', function() {
    return closeCursor();
  } );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78