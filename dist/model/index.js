'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

// Load system modules

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

// Load modules

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _monk = require('monk');

var _monk2 = _interopRequireDefault(_monk);

var _coMonk = require('co-monk');

var _coMonk2 = _interopRequireDefault(_coMonk);

// Load my modules

var _configMongoJson = require('../../config/mongo.json');

var _configMongoJson2 = _interopRequireDefault(_configMongoJson);

'use strict';

// Constant declaration
var COLLECTION_NAME = 'posts';

// Module variables declaration
var db = undefined,
    collection = undefined;
var log = _bunyan2['default'].createLogger({
  name: 'model',
  level: 'trace' });

// Module functions declaration
function getDB() {
  return db;
}
function getCollection() {
  var name = arguments[0] === undefined ? COLLECTION_NAME : arguments[0];

  return _coMonk2['default'](db.get(name));
}
function open() {
  var hostname = _configMongoJson2['default'].url;
  var dbName = _configMongoJson2['default'].database;
  var fullUrl = _url2['default'].resolve(hostname + '/', dbName);

  log.trace(fullUrl);
  db = _monk2['default'](fullUrl);
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
exports.open = open;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
exports.close = close;
exports.getDB = getDB;
exports.getCollection = getCollection;
//# sourceMappingURL=../model/index.js.map