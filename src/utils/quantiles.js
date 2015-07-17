'use strict';
// Load system modules

// Load modules
var _ = require( 'lodash' );

// Load my modules
var logger = require( './' ).logger;

// Constant declaration

// Module variables declaration
var log = logger.child( {
  component: 'Quantiles',
} );

// Module functions declaration
function calculateQuartile( i, base, data ) {
  var Fi = i/base;
  var n = data.length;
  var int = Math.floor;

  var prod = n*Fi;
  var val;

  // Check if the product is an integer
  if( int( prod )===prod ) {
    val = (data[ prod-1 ] + data[ prod ])/2;
  } else {
    val = data[ int( prod ) ];
  }

  return val;
}
function getQuantiles( num, base, data ) {
  var sortedData = _.sortByOrder( data, _.identity, 'asc' );
  log.trace( { values: sortedData }, 'Sorted %d values', sortedData.length );
  var quantiles = [];

  for( var i=1; i<=num; i++ ) {
    quantiles.push( calculateQuartile( i, base, sortedData ) );
  }
  log.trace( { quantiles: quantiles }, 'Quantiles' );

  return quantiles;
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports.getQuantiles = getQuantiles;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78