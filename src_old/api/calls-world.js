'use strict';
// Load system modules
let path = require( 'path' );
let fs = require( 'fs' );

// Load modules
let _ = require( 'lodash' );
let moment = require( 'moment' );

// Load my modules
let logger = require( './' ).logger;

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  log.trace( 'Rendering world page' );

  let page = path.join( __dirname, '..', 'pages', 'world.html' );

  this.type = 'text/html; charset=utf-8';
  this.body = fs.createReadStream( page );
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78