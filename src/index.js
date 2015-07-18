'use strict';
// Load system modules

// Load modules
var Promise = require( 'bluebird' );
var express = require( 'express' );
var bunyan = require( 'bunyan' );
var morgan = require( 'morgan' );
var mkdirp = Promise.promisifyAll( require( 'mkdirp' ) );

// Load my modules
var model = require( './model/' );
var cache = require( './utils/cache' );

var anomalies = require( './api/anomalies/' );
var tweets = require( './api/tweets/' );
var calls = require( './api/calls/' );
var middlewares = require( './api/' ).middlewares;

var config = require( '../config/server.json' );

// Constant declaration


// Module variables declaration
var app = express();
var server;
var log = bunyan.createLogger( {
  name: 'Server',
  level: 'trace',
} );


// Module functions declaration
function serverStarted() {
  var port = server.address().port;

  log.info( '%s listening on port %d', app.get( 'title' ), port );
}
function startServer() {
  server = app.listen( config.port, serverStarted );
}


// Module class declaration

// Module initialization (at first load)
app.set( 'title', 'UrbanScope server' );
app.enable( 'trust proxy' );


// Entry point
model
.connect()
.then( function() {
  // Create the cache dir if not present
  return mkdirp.mkdirpAsync( cache.CACHE_PATH );
} )
.then( function() {
  // Listen to errors
  app.use( morgan( 'dev' ) );

  // Set the endpoints

  // Anomalies
  app.get( '/anomaly/district', middlewares.cache, middlewares.tweets, anomalies.district );
  app.get( '/anomaly/top', middlewares.cache, middlewares.tweets, anomalies.top );

  // Tweets
  app.get( '/tweets/district', middlewares.cache, middlewares.tweets, tweets.district );
  app.get( '/tweets/timeline', middlewares.cache, middlewares.tweets, tweets.timeline );
  app.get( '/tweets/text', middlewares.cache, middlewares.tweets, tweets.text );

  // Calls
  app.get( '/calls/district', middlewares.calls, calls.district );
  app.get( '/calls/timeline', middlewares.calls, calls.timeline );
  app.get( '/calls/list', middlewares.calls, calls.list );
  app.get( '/calls/total', middlewares.calls, calls.total );
  app.get( '/calls/top', middlewares.calls, calls.top );
  app.get( '/calls/world', calls.world );

  app.use( middlewares.error );
} )
.then( startServer ) // listen to the server
;

process.on('uncaughtException', function( err ) {
  log.fatal( { err: err }, 'Uncaught exception, bye: ', err.stack );

  // Close the connection
  model
  .getDB()
  .close()
  .delay( 500 )
  .then( function() {
    process.exit(1);
  } );
} );

// Module exports

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78