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
  nilData.country = nilData._id; // eslint-disable-line no-underscore-dangle
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
  var limit = req.query.limit;
  limit = limit || 10;
  limit = Number( limit );

  var orderBy = req.query.orderBy;
  orderBy = orderBy || 'total';

  if( orderBy!=='total' && orderBy!=='in' && orderBy!=='out' ) {
    return next( new Error( 'The "orderBy" must be one of: "in","out","total"' ) );
  }

  // remove the nil filter
  delete query.nil;

  // Create the sort object for the pipeline
  var sortOpts = {};
  sortOpts[ orderBy ] = -1;

  var options = {
    allowDiskUse: true,
  };

  // Create the pipeline
  var pipeline = [];
  // Stage: match the posts with the specified filters
  pipeline.push( {
    $match: query,
  } );
  // Stage: group by the country and sum the in and out calls
  pipeline.push( {
    $group: {
      _id: '$country',
      in: { $sum: { $add: '$callIn' } },
      out: { $sum: { $add: '$callOut' } },
      total: { $sum: { $add: [ '$callOut', '$callIn' ] } },
    }
  } );
  // Stage: sort by the specified field
  pipeline.push( {
    $sort: sortOpts
  } );
  // Stage: limit the results
  pipeline.push( {
    $limit: limit,
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
      limit: limit,
      orderedBy: orderBy,

      // DATA
      calls: data,
    };

    return res.json( response );
  })
  .catch( next );


};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78