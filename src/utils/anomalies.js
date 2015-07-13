'use strict';
// Load system modules

// Load modules
let bunyan = require( 'bunyan' );
let _ = require( 'lodash' );

// Load my modules

// Constant declaration
const GREY_THRESHOLD = 20;
/*
const NILS_TO_USE = [
  1,
  2,
  4,
  6,
  7,
  9,
  10,
  11,
  20,
  21,
  22,
  35,
  44,
  51,
  52,
  60,
  69,
  71,
];
*/

// Module variables declaration
let logger = bunyan.createLogger( {
  name: 'anomalies',
  level: 'trace',
} );


// Module functions declaration
/*
function q( i, data ) {
  let Fi = i/4; // QUARTILE so we use: 4
  let n = data.length;
  let int = Math.floor;

  let prod = n*Fi;
  let val;

  // Check if the product is an integer
  if( int( prod )===prod ) {
    val = (data[ prod-1 ] + data[ prod ])/2;
  } else {
    val = data[ int( prod ) ];
  }

  return val;
}
*/
function q( i, data ) {
  let N = data.length;
  let val = (i/4)*(N+1);

  if( Math.floor( val )===val ) { // Intero
    return data[ val ];
  } else { // Non intero
    let int = Math.floor( val );
    let dec = val - int;

    return data[ int ] + ( data[ int+1 ] * dec );
  }
}
function q1( data ) {
  return q( 1, data );
}
function median( data ) {
  return q( 2, data );
}
function q3( data ) {
  return q( 3, data );
}
function q4( data ) {
  return q( 4, data );
}
let q2 = median;
function quartiles( percentages ) {
  let quartile1 = q1( percentages );
  let quartile2 = q2( percentages );
  let quartile3 = q3( percentages );
  // let quartile4 = q4( percentages );

  let quartiles = {
    quartile1: quartile1,
    quartile2: quartile2,
    quartile3: quartile3,
    // quartile4: quartile4,
  };
  logger.trace( { quartiles: quartiles }, 'Quartiles' );

  return quartiles;
}
function thresholds( percentages ) {
  let quarts = quartiles( percentages );
  let q1 = quarts.quartile1;
  let q3 = quarts.quartile3;


  let threshold1 = q1-1.5*(q3-q1);
  let threshold2 = q1;
  let threshold3 = q3;
  let threshold4 = q3+1.5*(q3-q1);

  let ths = {
    threshold1: threshold1,
    threshold2: threshold2,
    threshold3: threshold3,
    threshold4: threshold4,
  };

  logger.trace( { ths: ths }, 'Thresholds' );
  return ths;
}
function filterNils( posts, nil ) {
  logger.trace( 'Nil %s have %d posts', nil, posts.length );
  return posts.length>=GREY_THRESHOLD;
  // return _.contains( NILS_TO_USE, Number( nil ) );
}
function getLanguage( post ) {
  let lang = post.lang || 'und';
  lang = lang.toLowerCase()

  if( lang!=='it' && lang!=='en' ) {
    return 'other';
  } else {
    return lang;
  }
  // return lang;
}
function getLanguagesPercentage( posts ) {
  let length = posts.length;

  return _( posts )
  .countBy( getLanguage )
  .mapValues( function( count ) {
    return count/length;
  } )
  .value();
}

function getNonGrayNils( posts ) {
  return _( posts )
  .groupBy( 'nil' )
  .mapValues( 'length' )
  .pick( function( posts ) {
    return posts>=GREY_THRESHOLD;
  } )
  .map( function( numPosts, nil ) {
    return Number( nil );
  } )
  .filter( function( nil ) {
    return !isNaN( nil )
  } )
  .value();
}

function getNilAnomalies( posts, lang ) {
  logger.trace( 'Posts[ %d ]: ', posts.length/*, posts*/ );

  let nonGrayNils = getNonGrayNils( posts );
  logger.trace( { nonGrayNils: nonGrayNils }, 'Non gray nils' );

  let languagePercentagePerNil = _( posts )
  // Group by nil
  .groupBy( 'nil' )
  // Use only the non gray nils
  .pick( nonGrayNils )
  // Get the percentage of each language
  .mapValues( getLanguagesPercentage )
  .value();

  logger.trace( { langPercPerNil: languagePercentagePerNil }, 'languagePercentagePerNil' );

  // Calculate the quartiles and the thresholds of the selected language
  let selectedLanguagePercentages = _( languagePercentagePerNil )
  // Get the percentages for the selected language
  .map( lang )
  .filter( function( perc ) {
    return !isNaN( perc )
  } )
  // Sort ascending
  .sortBy()
  .value();

  logger.trace( { selLangPerc: selectedLanguagePercentages }, 'selectedLanguagePercentages "%s"', lang );

  let ths = thresholds( selectedLanguagePercentages );
  let t1 = ths.threshold1;
  let t2 = ths.threshold2;
  let t3 = ths.threshold3;
  let t4 = ths.threshold4;


  // Map the nil to the correct output
  return _( languagePercentagePerNil )
  .map( function( langs, nil ) {
    let selectedLanguagePercentage = langs[ lang ];
    let type;

    /*
    if( selectedLanguagePercentage<=t1 ) {
      type = 'Percentuale molto bassa';
    } else if ( selectedLanguagePercentage>t1 && selectedLanguagePercentage<=t2 ) {
      type = 'Percentuale bassa';
    } else
    if ( selectedLanguagePercentage>t2 && selectedLanguagePercentage<=t3 ) {
    */
    if ( selectedLanguagePercentage<=t3 ) {
      type = 'Percentuale non anomala';
    } else if ( selectedLanguagePercentage>t3 && selectedLanguagePercentage<=t4 ) {
      type = 'Percentuale alta';
    } else if ( selectedLanguagePercentage>t4 ) {
      type = 'Percentuale molto alta';
    }

    return {
      value: selectedLanguagePercentage,
      type: type,
      nil_id: Number( nil ), // eslint-disable-line camelcase
    };
  } )
  // .filter( 'type' )
  .value();
}


// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports.getNilAnomalies = getNilAnomalies;
module.exports.getNonGrayNils = getNonGrayNils;
// module.exports.NILS_TO_USE = NILS_TO_USE;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78