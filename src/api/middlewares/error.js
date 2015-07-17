'use strict';
// Load system modules

// Load modules

// Load my modules
var middleware = require( './' );
var logger = middleware.logger;

// Constant declaration

// Module variables declaration
var log = logger.child( {
  middleware: 'error',
} );

// Module functions declaration

// Module initialization (at first load)

// Module exports
module.exports = function errorMiddleware( err, req, res, next ) {
  log.error( { err: err }, 'Server error' );
  if( res.headersSent ) {
    return next( err );
  }

  res.status( 500 );
  res.json( {
    error: err.message,
  } );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78