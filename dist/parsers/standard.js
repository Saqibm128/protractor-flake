// note: we use String.raw here to avoid the need to double escape '\' characters
// e.g. using a traditional string we would need '\\[object Object\\]'
// whereas raw allows us the terser `\[` because it doesn't interpret '\' as an escape
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['[object Object]|Object|Context|UserContext'], ['\\[object Object\\]|Object|Context|UserContext']),
    _templateObject2 = _taggedTemplateLiteral(['<anonymous>|it|beforeEach|afterEach|before|after'], ['<anonymous>|it|beforeEach|afterEach|before|after']),
    _templateObject3 = _taggedTemplateLiteral(['(([A-Za-z]:\\)?.*?):.*'], ['(([A-Za-z]:\\\\)?.*?):.*']),
    _templateObject4 = _taggedTemplateLiteral(['at (?:', ').(?:', ') (', ')'], ['at (?:', ')\\.(?:', ') \\(', '\\)']);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var context = String.raw(_templateObject);
var source = String.raw(_templateObject2);
var filepath = String.raw(_templateObject3);
var regexString = String.raw(_templateObject4, context, source, filepath);

exports['default'] = {
  name: 'standard',

  parse: function parse(output) {
    var failedSpecs = new Set();
    var match = null;
    var FAILED_LINES = new RegExp(regexString, 'g');

    while (match = FAILED_LINES.exec(output)) {
      // eslint-disable-line no-cond-assign
      // windows output includes stack traces from
      // webdriver so we filter those out here
      if (!/node_modules/.test(match[1])) {
        failedSpecs.add(match[1]);
      }
    }

    return [].concat(_toConsumableArray(failedSpecs));
  }
};
module.exports = exports['default'];