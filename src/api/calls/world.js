'use strict';
// Load system modules
var path = require( 'path' );

// Load modules

// Load my modules
var logger = require( '../' ).logger;

// Constant declaration
var ENDPOINT = path.basename( __filename, '.js' );

// Module variables declaration
var log = logger.child( {
  endpoint: ENDPOINT,
} );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function( req, res, next ) {
  log.trace( 'Rendering world page' );

  var page = path.join( __dirname, '..', '..', 'pages', 'world.html' );
  return res.sendFile( page );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78