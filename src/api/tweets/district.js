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
function parseData( data ) {
  var nils = _( data )
  .map( function( nilData ) {

    nilData.langs = _.countBy( nilData.posts, 'lang' );
    delete nilData.posts;

    return nilData;
  } )
  .value();

  return nils;
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
      posts: { $push: '$$ROOT' },
      value: { $sum: { $add: 1 } },
    }
  } );
  // Stage: rename the fileds
  pipeline.push( {
    $project: {
      nil: '$_id',
      posts: 1,
      value: 1,
      _id: 0,
    }
  } );

  log.trace( { pipeline: pipeline }, 'Pipeline' );
  // Get the collection to perform the aggregation
  var collection = model.getPostsCollection();
  var cursor = collection.aggregate( pipeline, options );

  return cursor
  .toArray() // Get all the data
  .tap( function() {
    log.trace( 'Closing the cursor' );
    return cursor.close(); // close the cursor
  } )
  .then( parseData )
  .then( function( data ) {

    var response = {
      startDate: moment.utc( start ).format( DATE_FORMAT ),
      endDate: moment.utc( end ).format( DATE_FORMAT ),
      lang: lang,

      // DATA
      nils: _.sortByOrder( data, 'nil', 'asc' ),

      // Additional params
    };

    return res.json( response );
  })
  .catch( next );


};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78