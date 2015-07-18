'use strict';
// Load system modules

// Load modules
var moment = require( 'moment' );

// Load my modules
var logger = require( '../' ).logger;

// Constant declaration
var DATE_FORMAT = require( '../' ).DATE_FORMAT;

// Module variables declaration
var log = logger.child( {
  component: 'Middlewares',
} );

// Module functions declaration
function handleDates( start, end ) {
  // Sane default values
  start = start || moment.utc().startOf( 'month' ).format( DATE_FORMAT );
  end = end || moment.utc().endOf( 'month' ).format( DATE_FORMAT );

  // Normalize
  start = moment.utc( start, DATE_FORMAT, true );
  end = moment.utc( end, DATE_FORMAT, true );

  // Check dates
  if( !start.isValid() ) {
    throw new Error( 'Invalid "startDate" parameter. Use the format YYYY-MM-DD' );
  }
  if( !end.isValid() ) {
    throw new Error( 'Invalid "endDate" parameter. Use the format YYYY-MM-DD' );
  }

  return {
    start: start.startOf( 'day' ),
    end: end.endOf( 'day' ),
  };
}


function handleNils( nil ) {
  if( nil && nil!=='' ) {
    // Keep only the number
    return nil.split( ',' )
    .map( Number )
    .filter( function( n ) {
      return !isNaN( n ) && n>0;
    } );
  } else {
    return null;
  }
}


// Module initialization (at first load)

// Module exports
module.exports.logger = log;
module.exports.handleDates = handleDates;
module.exports.handleNils = handleNils;
module.exports.error = require( './error' );
module.exports.cache = require( './cache' );
module.exports.tweets = require( './tweets' );
module.exports.calls = require( './calls' );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78