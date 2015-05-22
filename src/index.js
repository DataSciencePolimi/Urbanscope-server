'use strict';
// Load system modules

// Load modules
let co = require( 'co' );
let koa = require( 'koa' );
let Router = require( 'koa-router' );
let cors = require( 'koa-cors' );
let bunyan = require( 'bunyan' );

// Load my modules
let serverConfig = require( '../config/server.json' );
let districtAnomaly = require( './api/district-anomaly' );
let topAnomaly = require( './api/top-anomaly' );
let districtTweets = require( './api/district-tweets' );
let timelineTweets = require( './api/timeline-tweets' );
let textTweets = require( './api/text-tweets' );
let openMongo = require( './model/' ).open;
let closeMongo = require( './model/' ).close;


// Constant declaration


// Module variables declaration
let app = koa();
let log = bunyan.createLogger( {
  name: 'server',
  level: 'trace',
} );


// Module functions declaration

// Module class declaration



// Module initialization (at first load)
app.name = 'UrbanScope server';
app.proxy = true;


// Entry point
co( function*() {
  // Setup mongo
  openMongo();

  // Middlewares
  app.use( cors() );

  // Add endpoints
  let router = new Router( app );

  router.get( '/anomaly/district', districtAnomaly );
  router.get( '/anomaly/top', topAnomaly );
  router.get( '/tweets/district', districtTweets );
  router.get( '/tweets/timeline', timelineTweets );
  router.get( '/tweets/text', textTweets );

  // Add the router to the Koa Application
  app.use( router.routes() );
  app.use( router.allowedMethods() );

  // Start server
  let port = serverConfig.port;
  log.debug( 'Start server @ port %d', port );
  app.listen( port );
} )
.catch( function( err ) {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
  process.exit( 1 );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78