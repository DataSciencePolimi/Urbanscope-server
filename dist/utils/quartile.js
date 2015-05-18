'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

'use strict';
// Load system modules

// Load modules

// Load my modules

// Constant declaration
var GREY_THRESHOLD = 6;

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

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
exports.q = q;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../utils/quartile.js.map