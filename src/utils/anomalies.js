'use strict';
// Load system modules

// Load modules
import _ from 'lodash';

// Load my modules

// Constant declaration
const GREY_THRESHOLD = 6;
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

// Module variables declaration

// Module functions declaration
function q( i, data ) {
  let Fi = i/4; // QUARTILE so we use: 4
  let n = data.length;
  let int = Math.floor;

  let prod = n*Fi;
  let val;
  if( int( prod )===prod ) {
    val = (data[ prod-1 ] + data[ prod ])/2;
  } else {
    val = data[ int( prod ) ];
  }

  return val;
}
function quartiles( percentages ) {
  let quartile1 = q( 1, percentages );
  let quartile2 = q( 2, percentages );
  let quartile3 = q( 3, percentages );
  let quartile4 = q( 4, percentages );

  return {
    quartile1,
    quartile2,
    quartile3,
    quartile4,
  };
}
function thresholds( percentages ) {
  let {
    quartile1: q1,
    quartile3: q3,
  } = quartiles( percentages );

  let threshold1 = q1-1.5*(q3-q1);
  let threshold2 = q1;
  let threshold3 = q3;
  let threshold4 = q3+1.5*(q3-q1);

  return {
    threshold1,
    threshold2,
    threshold3,
    threshold4,
  };
}
/*
function filterNils( posts, nil ) {
  // return posts.length>=GREY_THRESHOLD;
  return _.contains( NILS_TO_USE, Number( nil ) );
}
*/
function getLanguage( post ) {
  let lang = post.lang.toLowerCase();
  if( lang!=='it' && lang!=='en' ) {
    return 'other';
  } else {
    return lang;
  }
}
function getLanguagesPercentage( posts ) {
  let length = posts.length;

  return _( posts )
  .countBy( getLanguage )
  .mapValues( count => count/length )
  .value();
}

function getNilAnomalies( posts, lang ) {

  let languagePercentagePerNil = _( posts )
  // Group by nil
  .groupBy( 'nil' )
  // Use only the provided NILS
  .pick( NILS_TO_USE )
  // Get the percentage of each language
  .mapValues( getLanguagesPercentage )
  .value();

  // Calculate the quartiles and the thresholds of the selected language
  let selectedLanguagePercentages = _( languagePercentagePerNil )
  // Get the percentages for the selected language
  .map( lang )
  // Sort ascending
  .sortBy()
  .value();

  let {
    threshold1: t1,
    threshold2: t2,
    threshold3: t3,
    threshold4: t4,
  } = thresholds( selectedLanguagePercentages );


  // Map the nil to the correct output
  return _( languagePercentagePerNil )
  .map( function( langs, nil ) {
    let selectedLanguagePercentage = langs[ lang ];
    let type;

    if( selectedLanguagePercentage<=t1 ) {
      type = 'perc molt bas';
    } else if ( selectedLanguagePercentage>t1 && selectedLanguagePercentage<=t2 ) {
      type = 'perc bas';
    } else if ( selectedLanguagePercentage>t2 && selectedLanguagePercentage<=t3 ) {
      type = 'perc non ano';
    } else if ( selectedLanguagePercentage>t3 && selectedLanguagePercentage<=t4 ) {
      type = 'perc alt';
    } else if ( selectedLanguagePercentage>t4 ) {
      type = 'perc mol alt';
    }

    return {
      value: selectedLanguagePercentage,
      type,
      nil_id: Number( nil ), // jshint ignore:line
    };
  } )
  .filter( 'type' )
  .value();
}


// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
export { getNilAnomalies };


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78