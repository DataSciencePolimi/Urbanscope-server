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
  var newData = _.omit( nilData, 'countries' );

  newData.countries = _( nilData.countries )
  .groupBy( 'country' )
  .mapValues( function( data ) {
    return _.sum( data, 'value' );
  } )
  .value();

  return newData;
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
  var type = req.query.type;
  type = type || 'in';
  type = type.toLowerCase();

  // Errors
  if( type!=='in' && type!=='out' ) {
    return next( new Error( 'The "type" parameter must be one of: "in", "out"' ) );
  }

  var field = 'callIn';
  if( type==='out' ) {
    field = 'callOut';
  }

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
      _id: '$nil',
      countries: {
        $push: {
          value: '$'+field,
          country: '$country',
        }
      },
      value: { $sum: { $add: '$'+field } },
    }
  } );
  // Stage: rename the fileds
  pipeline.push( {
    $project: {
      _id: 0,
      nil: '$_id',
      value: 1,
      countries: 1,
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
      type: type,

      // DATA
      nils: data,

      // Additional params
      nil_ID: nils || 'all', // eslint-disable-line camelcase
    };

    return res.json( response );
  })
  .catch( next );


};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78