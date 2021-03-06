'use strict';
// Load system modules

// Load modules
var bunyan = require( 'bunyan' );

// Load my modules

// Constant declaration
var DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
var logger = bunyan.createLogger( {
  name: 'API Requests',
  level: 'trace',
} );

// Module functions declaration


// Module initialization (at first load)

// Module exports
module.exports.logger = logger;
module.exports.DATE_FORMAT = DATE_FORMAT;
module.exports.middlewares = require( './middlewares/' );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78