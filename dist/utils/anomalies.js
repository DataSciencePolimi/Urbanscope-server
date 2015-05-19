'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

// Load system modules

// Load modules

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
  var _quartiles = quartiles(percentages);

  var q1 = _quartiles.quartile1;
  var q3 = _quartiles.quartile3;

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

  return (0, _lodash2['default'])(posts).countBy(getLanguage).mapValues(function (count) {
    return count / length;
  }).value();
}

function getNilAnomalies(posts, lang) {

  var languagePercentagePerNil = (0, _lodash2['default'])(posts)
  // Group by nil
  .groupBy('nil')
  // Use only the provided NILS
  .pick(NILS_TO_USE)
  // Get the percentage of each language
  .mapValues(getLanguagesPercentage).value();

  // Calculate the quartiles and the thresholds of the selected language
  var selectedLanguagePercentages = (0, _lodash2['default'])(languagePercentagePerNil)
  // Get the percentages for the selected language
  .map(lang)
  // Sort ascending
  .sortBy().value();

  var _thresholds = thresholds(selectedLanguagePercentages);

  var t1 = _thresholds.threshold1;
  var t2 = _thresholds.threshold2;
  var t3 = _thresholds.threshold3;
  var t4 = _thresholds.threshold4;

  // Map the nil to the correct output
  return (0, _lodash2['default'])(languagePercentagePerNil).map(function (langs, nil) {
    var selectedLanguagePercentage = langs[lang];
    var type = undefined;

    if (selectedLanguagePercentage <= t1) {
      type = 'Percentiale molto bassa';
    } else if (selectedLanguagePercentage > t1 && selectedLanguagePercentage <= t2) {
      type = 'Percentiale bassa';
    } else if (selectedLanguagePercentage > t2 && selectedLanguagePercentage <= t3) {
      type = 'Percentiale non anomala';
    } else if (selectedLanguagePercentage > t3 && selectedLanguagePercentage <= t4) {
      type = 'Percentiale alta';
    } else if (selectedLanguagePercentage > t4) {
      type = 'Percentiale molto alta';
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
exports.getNilAnomalies = getNilAnomalies;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
exports.NILS_TO_USE = NILS_TO_USE;
// jshint ignore:line
//# sourceMappingURL=../utils/anomalies.js.map