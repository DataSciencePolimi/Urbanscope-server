'use strict';
// Load system modules

// Load modules

// Load my modules
var middleware = require( './' );
var logger = middleware.logger;

// Constant declaration

// Module variables declaration
var log = logger.child( {
  middleware: 'calls',
} );

// Module functions declaration

// Module initialization (at first load)

// Module exports
module.exports = function callsMiddleware( req, res, next ) {
  log.trace( 'Calls middleware' );
  res.locals = res.locals || {};

  var qs = req.query;
  log.debug( { qs: qs }, 'Query string' );

  // Get param values
  var dates = middleware.handleDates( qs.startDate, qs.endDate );
  var nils = middleware.handleNils( qs.nil_ID );  // eslint-disable-line camelcase
  var start = dates.start;
  var end = dates.end;

  // Default values

  // Normalize query parameters

  // Errors
  if( start.isAfter( end ) ) {
    return next( new Error( 'The "start" date must be before the "end" date' ) );
  }
  if( start.isSame( end, 'day' ) ) {
    return next( new Error( 'The "start" and "end" dates must be different' ) );
  }


  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );
  log.trace( 'Nils: %s', nils );


  // Generate db query
  var dbQuery = {
    date: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Add the nils to the query
  if( nils ) {
    dbQuery.nil = { $in: nils };
  }


  // Add the generated data to the locals namespace
  res.locals.query = dbQuery;
  res.locals.params = {
    start: start.toDate(),
    end: end.toDate(),
    nils: nils,
  };

  return next();
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78