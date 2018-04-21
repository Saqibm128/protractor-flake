'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cucumber = require('./cucumber');

var _cucumber2 = _interopRequireDefault(_cucumber);

var _path = require('path');

var _multi = require('./multi');

var _multi2 = _interopRequireDefault(_multi);

var _standard = require('./standard');

var _standard2 = _interopRequireDefault(_standard);

var all = { cucumber: _cucumber2['default'], multi: _multi2['default'], standard: _standard2['default'] };

function handleObject(parserObject) {
  if (typeof parserObject.parse !== 'function') {
    throw new Error('Invalid Parser Object specified. Your parser must define a `parse` method');
  }

  return parserObject;
}

function handlePath(parserPath) {
  // 'my-custom-parser' or './my-custom-parser'
  try {
    return require(parserPath);
  } catch (e) {}

  // /path/to/parser or ../path/to/parser
  try {
    return require((0, _path.resolve)(parserPath));
  } catch (e) {}

  throw new Error('Invalid Custom Parser Path Specified: ' + parserPath);
}

function handleFlakeParser(parserName) {
  if (all[parserName]) {
    return all[parserName];
  } else {
    throw new Error('Invalid Parser Specified: ' + parserName);
  }
}

function getParser() {
  var parser = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  if (parser.hasOwnProperty('parse')) {
    return handleObject(parser);
  }

  if ((0, _path.extname)(parser)) {
    return handlePath(parser);
  }

  return handleFlakeParser(parser);
}

exports['default'] = { all: all, getParser: getParser };
module.exports = exports['default'];