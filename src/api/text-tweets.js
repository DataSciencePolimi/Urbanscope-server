'use strict';
// Load system modules
import path from 'path';

// Load modules
import moment from 'moment';

// Load my modules
import logger from './';
import { getCollection } from '../model/';

// Constant declaration
const ENDPOINT = path.basename( __filename, '.js' );
const DATE_FORMAT = 'YYYY-MM-DD';

// Module variables declaration
let log = logger.child( { endpoint: ENDPOINT } );

// Module functions declaration
function now() {
  return moment().format( DATE_FORMAT );
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
export default function*() {
  let qs = this.request.query;
  let {
    startDate: start,
    endDate: end,
    nil_ID: nil, // jshint ignore: line
  } = qs;
  log.trace( { qs }, 'Query string' );

  // Default values
  start = start || now();
  end = end || now();

  start = moment.utc( start, DATE_FORMAT ).startOf( 'day' ).toDate();
  end = moment.utc( end, DATE_FORMAT ).endOf( 'day' ).toDate();
  nil = Number( nil );

  log.trace( 'Start: %s', start );
  log.trace( 'End: %s', end );
  log.trace( 'Nil: %s', nil );

  let query = {
    source: 'twitter',
    date: {
      $gte: start,
      $lte: end,
    },
    nil
  };

  log.debug( { query }, 'Performing the query' );
  let collection = getCollection();
  let tweets = yield collection.find( query, 'id lang date author authorId text' );

  let response = {
    startDate: moment( start ).format( DATE_FORMAT ),
    endDate: moment( end ).format( DATE_FORMAT ),
    tweets,
  };

  this.body = response;
}


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78