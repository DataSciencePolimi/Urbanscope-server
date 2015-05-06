'use strict';
// Load system modules
import url from 'url';

// Load modules
import bunyan from 'bunyan';
import monk from 'monk';
import wrap from 'co-monk';

// Load my modules
import config from '../../config/mongo.json';

// Constant declaration
const COLLECTION_NAME = 'posts';

// Module variables declaration
let db, collection;
let log = bunyan.createLogger( {
  name: 'model',
  level: 'trace',
} );


// Module functions declaration
function getDB() {
  return db;
}
function getCollection( name=COLLECTION_NAME ) {
  return wrap( db.get( name ) );
}
function open() {
  let hostname = config.url;
  let dbName = config.database;
  let fullUrl = url.resolve( hostname+'/', dbName );

  log.trace( fullUrl );
  db = monk( fullUrl );
  collection = getCollection();

  return db;
}
function close() {
  db.close();
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
export { open, close, getDB, getCollection };


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78