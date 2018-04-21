'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

exports['default'] = {
  name: 'multi',

  parse: function parse(output) {
    var match = null;
    var failedSpecs = new Set();
    var testsOutput = output.split('------------------------------------');
    var RESULT_REG = /,\s0 failures/g;
    var SPECFILE_REG = /.+Specs:\s(.*\.(js|coffee))/g;
    testsOutput.forEach(function (test) {
      var specfile = undefined;
      var result = 'failed';
      // retrieve specfile from run
      while (match = SPECFILE_REG.exec(test)) {
        // eslint-disable-line no-cond-assign
        specfile = match[1];
      }
      // check for string '0 failures' and then marks the test as passed
      while (match = RESULT_REG.exec(test)) {
        // eslint-disable-line no-cond-assign
        result = 'passed';
      }
      if (specfile && result === 'failed') {
        if (!/node_modules/.test(specfile)) {
          failedSpecs.add(specfile);
        }
      }
    });

    return [].concat(_toConsumableArray(failedSpecs));
  }
};
module.exports = exports['default'];