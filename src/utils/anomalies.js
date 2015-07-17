'use strict';
// Load system modules

// Load modules
var _ = require( 'lodash' );

// Load my modules
var logger = require( './' ).logger;
var model = require( '../model/' );
var quantiles = require( './quantiles' );

// Constant declaration
var THRESHOLD = 100;

// Module variables declaration
var log = logger.child( {
  component: 'Anomalies',
} );

// Module functions declaration
function getPostLanguage( post ) {
  var lang = post.lang || 'und';
  lang = lang.toLowerCase();

  if( lang!=='it' && lang!=='en' ) {
    return 'other';
  } else {
    return lang;
  }
}
function parseNil( lang, nilData ) {
  var nil = nilData[ '_id' ];
  var total = nilData.count;
  var posts = nilData.posts;

  var langPercentagePerNil = _( posts )
  .countBy( getPostLanguage ) // Count number of posts by language
  .mapValues( function( num ) {
    return num/total; // Get the percentage
  } )
  .value();

  return {
    value: langPercentagePerNil[ lang ] || 0,
    nil_id: nil, // eslint-disable-line camelcase
  };
}
/*
function parseData( lang, data ) {
  log.trace( 'Parsing %d posts: ', data.length );
  var langPercentagePerNil = _( data )
  .map( _.partial( parseNil, lang ) )
  .value();

  return langPercentagePerNil;
}
*/
function assignClass( data ) {
  var values = _.map( data, 'value' );
  var q = quantiles.getQuantiles( 3, 4, values );

  // var t1 = q[0] - 1.5*(q[2]-q[0]);
  // var t2 = q[0];
  var t3 = q[2];
  var t4 = q[2] + 1.5*(q[2]-q[0]);
  log.trace( 'T3: %d', t3 );
  log.trace( 'T4: %d', t4 );

  return _.map( data, function( e ) {

    if( e.value<=t3 ) {
      e.type = 'Percentuale non anomala';
    } else if( e.value>t3 && e.value<=t4 ) {
      e.type = 'Percentuale alta';
    } else if( e.value>t4 ) {
      e.type = 'Percentuale molto alta';
    }

    return e;
  } );
}
function getAnomaliesForLanguage( filter, lang ) {
  if( !lang || lang==='' || lang==='und' ) {
    throw new Error( 'Cannot find anomalies with an undefined language' );
  }
  log.debug( { filter: filter }, 'Get anomalies for lang: "%s"', lang );

  var options = {
    allowDiskUse: true,
  };

  // Create the pipeline
  var pipeline = [];
  // Stage: match the posts with the specified filters
  pipeline.push( {
    $match: filter,
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
      count: { $sum: { $add: 1 } },
    }
  } );
  // Stage: filter out the non suitable nils
  pipeline.push( {
    $match: {
      count: { $gt: THRESHOLD },
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
  .map( _.partial( parseNil, lang ) ) // parse the aggregation result
  .then( assignClass ) // assign class to each value
  ;
}

// Module initialization (at first load)

// Entry point

// Module exports
module.exports.getAnomaliesForLanguage = getAnomaliesForLanguage;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78