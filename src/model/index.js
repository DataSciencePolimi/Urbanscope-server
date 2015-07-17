'use strict';
// Load system modules
var url = require( 'url' );

// Load modules
var bunyan = require( 'bunyan' );
var Promise = require( 'bluebird' );
var MongoClient = require( 'mongodb' ).MongoClient;
var Logger = require('mongodb').Logger;

// Load my modules
var config = require( '../../config/mongo.json' );

// Constant declaration
var POSTS_COLLECTION_NAME = 'posts';
var CALLS_COLLECTION_NAME = 'telecom';

// Module variables declaration
var db;
var log = bunyan.createLogger( {
  name: 'model',
  level: 'trace',
} );

// Module functions declaration
function getDB() {
  return db;
}
function getCallsCollection() {
  return db.collection( CALLS_COLLECTION_NAME );
}
function getPostsCollection() {
  return db.collection( POSTS_COLLECTION_NAME );
}
function connect() {
  var hostname = config.url;
  var dbName = config.database;
  var fullUrl = url.resolve( hostname+'/', dbName );

  log.trace( 'Connecting to: "%s"', fullUrl );

  return MongoClient.connect( fullUrl, {
    promiseLibrary: Promise,
  } )
  .then( function( myDB ) {

    db = myDB;
    //Logger.setLevel( 'debug' );

    return myDB;
  } )
  ;
}

// Module class declaration

// Module initialization (at first load)

// Module exports
module.exports.connect = connect;
module.exports.getDB = getDB;
module.exports.getPostsCollection = getPostsCollection;
module.exports.getCallsCollection = getCallsCollection;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78