'use strict';
// Load system modules

// Load modules
var _ = require('lodash');

// Load my modules

// Constant declaration
var GREY_THRESHOLD = 6;
var NILS_TO_USE = [1, 2, 4, 6, 7, 9, 10, 11, 20, 21, 22, 35, 44, 51, 52, 60, 69, 71];

// Module variables declaration

// Module functions declaration
function q(i, data) {
  var Fi = i / 4; // QUARTILE so we use: 4
  var n = data.length;
  var int = Math.floor;

  var prod = n * Fi;
  var val = undefined;

  // Check if the product is an integer
  if (int(prod) === prod) {
    val = (data[prod - 1] + data[prod]) / 2;
  } else {
    val = data[int(prod)];
  }

  return val;
}
function quartiles(percentages) {
  var quartile1 = q(1, percentages);
  var quartile2 = q(2, percentages);
  var quartile3 = q(3, percentages);
  var quartile4 = q(4, percentages);

  return {
    quartile1: quartile1,
    quartile2: quartile2,
    quartile3: quartile3,
    quartile4: quartile4 };
}
function thresholds(percentages) {
  var quarts = quartiles(percentages);
  var q1 = quarts.quartile1;
  var q3 = quarts.quartile3;

  var threshold1 = q1 - 1.5 * (q3 - q1);
  var threshold2 = q1;
  var threshold3 = q3;
  var threshold4 = q3 + 1.5 * (q3 - q1);

  return {
    threshold1: threshold1,
    threshold2: threshold2,
    threshold3: threshold3,
    threshold4: threshold4 };
}
/*
function filterNils( posts, nil ) {
  // return posts.length>=GREY_THRESHOLD;
  return _.contains( NILS_TO_USE, Number( nil ) );
}
*/
function getLanguage(post) {
  var lang = post.lang.toLowerCase();
  if (lang !== 'it' && lang !== 'en') {
    return 'other';
  } else {
    return lang;
  }
}
function getLanguagesPercentage(posts) {
  var length = posts.length;

  return _(posts).countBy(getLanguage).mapValues(function (count) {
    return count / length;
  }).value();
}

function getNilAnomalies(posts, lang) {

  var languagePercentagePerNil = _(posts)
  // Group by nil
  .groupBy('nil')
  // Use only the provided NILS
  .pick(NILS_TO_USE)
  // Get the percentage of each language
  .mapValues(getLanguagesPercentage).value();

  // Calculate the quartiles and the thresholds of the selected language
  var selectedLanguagePercentages = _(languagePercentagePerNil)
  // Get the percentages for the selected language
  .map(lang)
  // Sort ascending
  .sortBy().value();

  var ths = thresholds(selectedLanguagePercentages);
  var t1 = ths.threshold1;
  var t2 = ths.threshold2;
  var t3 = ths.threshold3;
  var t4 = ths.threshold4;

  // Map the nil to the correct output
  return _(languagePercentagePerNil).map(function (langs, nil) {
    var selectedLanguagePercentage = langs[lang];
    var type = undefined;

    if (selectedLanguagePercentage <= t1) {
      type = 'Percentuale molto bassa';
    } else if (selectedLanguagePercentage > t1 && selectedLanguagePercentage <= t2) {
      type = 'Percentuale bassa';
    } else if (selectedLanguagePercentage > t2 && selectedLanguagePercentage <= t3) {
      type = 'Percentuale non anomala';
    } else if (selectedLanguagePercentage > t3 && selectedLanguagePercentage <= t4) {
      type = 'Percentuale alta';
    } else if (selectedLanguagePercentage > t4) {
      type = 'Percentuale molto alta';
    }

    return {
      value: selectedLanguagePercentage,
      type: type,
      nil_id: Number(nil) };
  }).filter('type').value();
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
module.exports.getNilAnomalies = getNilAnomalies;
module.exports.NILS_TO_USE = NILS_TO_USE;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
// jshint ignore:line
//# sourceMappingURL=../utils/anomalies.js.map