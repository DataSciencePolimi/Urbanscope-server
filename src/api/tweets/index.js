'use strict';
// Load system modules

// Load modules

// Load my modules
var logger = require( '../' ).logger;

// Constant declaration

// Module variables declaration
var log = logger.child( {
  component: 'tweets',
} );

// Module functions declaration

// Module initialization (at first load)

// Module exports
module.exports.logger = log;
module.exports.district = require( './district' );
module.exports.timeline = require( './timeline' );
module.exports.text = require( './text' );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78