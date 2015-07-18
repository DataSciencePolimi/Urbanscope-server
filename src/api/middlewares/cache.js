'use strict';
// Load system modules

// Load modules

// Load my modules
var cache = require( '../../utils/cache' );
var middleware = require( './' );
var logger = middleware.logger;

// Constant declaration

// Module variables declaration
var log = logger.child( {
  middleware: 'cache',
} );

// Module functions declaration

// Module initialization (at first load)

// Module exports
module.exports = function cacheMiddleware( req, res, next ) {
  cache.get( req, function( err, filePath ) {
    if( err ) {
      log.trace( 'Cache miss' );
      return next();
    } else {
      log.trace( 'Cache hit' );
      return res.sendFile( filePath );
    }
  } );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78