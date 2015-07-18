'use strict';
// Load system modules
var path = require( 'path' );

// Load modules
var moment = require( 'moment' );
var _ = require( 'lodash' );

// Load my modules
var cache = require( '../../utils/cache' );
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
function mapData( nilData ) {
  var data = {};

  data.nil = nilData._id; // eslint-disable-line no-underscore-dangle
  data.value = nilData.value;
  data.langs = _.countBy( nilData.langs );

  return data;
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
  var nils = params.nils;

  var options = {
    allowDiskUse: true,
  };

  // Create the pipeline
  var pipeline = [];
  // Stage: match the posts with the specified filters
  pipeline.push( {
    $match: query,
  } );
  // Stage: keep only the fields needed for later computation
  pipeline.push( {
    $project: {
      _id: 0,
      lang: 1,
      nil: 1,
    },
  } );
  // Stage: group by the nil, and count the elements in each group
  pipeline.push( {
    $group: {
      _id: '$nil',
      langs: { $push: '$lang' },
      value: { $sum: { $add: 1 } },
    }
  } );

  log.trace( { pipeline: pipeline }, 'Pipeline' );
  // Get the collection to perform the aggregation
  var collection = model.getPostsCollection();
  var cursor = collection.aggregate( pipeline, options );

  return cursor
  .toArray()
  .tap( function() {
    log.trace( 'Closing the cursor' );
    return cursor.close(); // close the cursor
  } )
  .map( mapData )
  .then( function( data ) {

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      lang: lang,

      // Additional params
      selectedNils: nils || 'all',

      // DATA
      nils: _.sortByOrder( data, 'nil', 'asc' ),

    };

    return cache.save( response, req, res, next );
  })
  .catch( next );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78