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
  var year = nilData._id.y; // eslint-disable-line no-underscore-dangle
  var month = nilData._id.m; // eslint-disable-line no-underscore-dangle

  nilData.date = ''+year;
  nilData.date += '-';
  nilData.date += ''+( month>9? month: '0'+month );
  delete nilData._id; // eslint-disable-line no-underscore-dangle

  return nilData;
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

  var options = {
    allowDiskUse: true,
  };

  // Create the pipeline
  var pipeline = [];
  // Stage: match the posts with the specified filters
  pipeline.push( {
    $match: query,
  } );
  // Stage: group by the nil, and count the elements in each group
  pipeline.push( {
    $group: {
      _id: {
        y: { $year: '$date' },
        m: { $month: '$date' },
      },
      in: { $sum: { $add: '$callIn' } },
      out: { $sum: { $add: '$callOut' } },
      total: { $sum: { $add: [ '$callOut', '$callIn' ] } },
    }
  } );


  log.trace( { pipeline: pipeline }, 'Pipeline' );
  // Get the collection to perform the aggregation
  var collection = model.getCallsCollection();
  var cursor = collection.aggregate( pipeline, options );

  return cursor
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

      // DATA
      timeline: _.sortByOrder( data, 'date' , 'asc' ),
    };

    return res.json( response );
  })
  .catch( next );


};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78