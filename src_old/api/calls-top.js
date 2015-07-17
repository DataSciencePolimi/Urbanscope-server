'use strict';
// Load system modules
let path = require( 'path' );

// Load modules
let _ = require( 'lodash' );
let moment = require( 'moment' );

// Load my modules
let logger = require( './' ).logger;
let getCollection = require( '../model/' ).getCollection;
// import nils from '../../config/nils.json';

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = require( './' ).DATE_FORMAT;

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports = function* () {
  let query = this.api.query;
  let params = this.api.params;
  let start = params.start;
  let end = params.end;

  let qs = this.request.query;

  // Get limit
  let limit = qs.limit || 10;
  limit = Number( limit );

  // Get order by
  let orderBy = qs.orderBy || 'total';
  orderBy = (''+orderBy).toLowerCase();

  if( orderBy!=='total' && orderBy!=='in' && orderBy!=='out' ) {
    throw new Error( 'The "orderBy" must be one of: "in","out","total"' );
  }

  log.trace( { query: query }, 'Final query' );
  let collection = getCollection( 'telecom' );
  let data = yield collection.find( query );

  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    limit: limit,
    orderedBy: orderBy,
  };

  response.calls = _( data )
  .groupBy( 'country' )
  .map( function( calls, country ) {
    let totalIn = _.sum( calls, 'callIn' );
    let totalOut = _.sum( calls, 'callOut' );

    return {
      'in': totalIn,
      out: totalOut,
      total: totalIn+totalOut,
      country: country,
    }
  } )
  .sortByOrder( orderBy, false )
  .take( limit )
  .value();

  this.body = response;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78