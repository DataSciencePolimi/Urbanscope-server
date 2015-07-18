'use strict';
// Load system modules
var crypto = require( 'crypto' );
var path = require( 'path' );
var fs = require( 'fs' );

// Load modules

// Load my modules
var logger = require( './' ).logger;

// Constant declaration
var CACHE_PATH = path.join( __dirname, '..', '..', 'cache' );

// Module variables declaration
var log = logger.child( {
  component: 'Cache',
} );

// Module functions declaration
function getUrl( req ) {
  return req.originalUrl;
}
function getCacheFilePath( req ) {
  var url = getUrl( req );
  var context = req.path.split( '/' ).slice( 1 ).join( '-' );

  var md5 = crypto.createHash( 'md5' ).update( url ).digest( 'hex' );

  log.trace( 'Context: "%s"', context );
  log.trace( 'Request url: "%s"', url );
  log.trace( 'MD5: %s', md5 );

  var cacheFile = path.join( CACHE_PATH, context+'-'+md5+'.json' );
  return cacheFile;
}
function saveCacheEntry( data, req, res, next ) {
  var cacheFile = getCacheFilePath( req );
  log.trace( 'Saving cache entry for: %s', cacheFile );
  fs.writeFile( cacheFile, JSON.stringify( data ), 'utf8', function( err ) {
    if( err ) return next( err );
    return res.json( data );
  } );
}
function getCacheEntry( req, cb ) {
  var cacheFile = getCacheFilePath( req );
  log.trace( 'Looking for "%s"', path.basename( cacheFile ) );

  fs.access( cacheFile, fs.R_OK, function( err ) {
    if( err ) {
      return cb( err );
    } else {
      return cb( null, cacheFile );
    }
  } );
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports.get = getCacheEntry;
module.exports.save = saveCacheEntry;
module.exports.CACHE_PATH = CACHE_PATH;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78