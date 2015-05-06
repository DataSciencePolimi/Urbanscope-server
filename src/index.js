'use strict';
// Load system modules

// Load modules
import co from 'co';
import koa from 'koa';
import Router  from 'koa-router';
import cors  from 'koa-cors';
import bunyan from 'bunyan';

// Load my modules
import { open as openMongo, close as closeMongo } from './model/';
import serverConfig from '../config/server.json';
import districtAnomaly from './api/district-anomaly';
import topAnomaly from './api/top-anomaly';
import districtTweets from './api/district-tweets';
import timelineTweets from './api/timeline-tweets';
import textTweets from './api/text-tweets';


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
  let { port } = serverConfig;
  log.debug( 'Start server @ port %d', port );
  app.listen( port );
} )
.catch( err => {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
  process.exit( 1 );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78