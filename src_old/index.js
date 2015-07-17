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

let anomalyDistrict = require( './api/anomaly-district' );
let anomalyTop = require( './api/anomaly-top' );

let tweetsDistrict = require( './api/tweets-district' );
let tweetsTimeline = require( './api/tweets-timeline' );
let tweetsText = require( './api/tweets-text' );

let callsDistrict = require( './api/calls-district' );
let callsTimeline = require( './api/calls-timeline' );
let callsWorld = require( './api/calls-world' );
let callsTotal = require( './api/calls-total' );
let callsList = require( './api/calls-list' );
let callsTop = require( './api/calls-top' );

let openMongo = require( './model/' ).open;
let closeMongo = require( './model/' ).close;
let tweetsApiMiddleware = require( './api/' ).tweetsApiMiddleware;
let callsApiMiddleware = require( './api/' ).callsApiMiddleware;


// Constant declaration


// Module variables declaration
let app = koa();
let log = bunyan.createLogger( {
  name: 'server',
  level: 'trace',
} );


// Module functions declaration
function* checkForError( next ) {
  try {
    yield next;
    if( this.response.status===404 && !this.response.body ) {
      this.throw( 404 );
    }
  } catch( err ) {
    log.error( err, 'Got error' );
    this.app.emit( 'error', err, this );
    this.body = {
      error: err.message,
    };
  }
}

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
  let apiRoutes = new Router( app );

  apiRoutes.use( checkForError );

  // Anomalies
  apiRoutes.get( '/anomaly/district', tweetsApiMiddleware, anomalyDistrict );
  apiRoutes.get( '/anomaly/top', tweetsApiMiddleware, anomalyTop );

  // Tweets
  apiRoutes.get( '/tweets/district', tweetsApiMiddleware, tweetsDistrict );
  apiRoutes.get( '/tweets/timeline', tweetsApiMiddleware, tweetsTimeline );
  apiRoutes.get( '/tweets/text', tweetsApiMiddleware, tweetsText );

  // Calls
  apiRoutes.get( '/calls/district', callsApiMiddleware, callsDistrict );
  apiRoutes.get( '/calls/timeline', callsApiMiddleware, callsTimeline );
  apiRoutes.get( '/calls/list', callsApiMiddleware, callsList );
  apiRoutes.get( '/calls/total', callsApiMiddleware, callsTotal );
  apiRoutes.get( '/calls/top', callsApiMiddleware, callsTop );
  apiRoutes.get( '/calls/world', callsWorld );


  // Add the router to the Koa Application
  app.use( apiRoutes.routes() );
  app.use( apiRoutes.allowedMethods() );

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