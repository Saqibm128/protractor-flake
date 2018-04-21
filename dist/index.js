'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _parsers = require('./parsers');

var _parseOptions = require('./parse-options');

var _parseOptions2 = _interopRequireDefault(_parseOptions);

require('core-js/shim');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function filterArgs(protractorArgs) {
  protractorArgs = protractorArgs.filter(function (arg) {
    return !/^--(suite|specs)=/.test(arg);
  });
  ['--suite', '--specs'].forEach(function (item) {
    var index = protractorArgs.indexOf(item);
    if (index !== -1) {
      protractorArgs.splice(index, 2);
    }
  });
  return protractorArgs;
}

exports['default'] = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var callback = arguments.length <= 1 || arguments[1] === undefined ? function noop() {} : arguments[1];

  var testAttempt = 1;
  var parsedOptions = (0, _parseOptions2['default'])(options);
  var parser = (0, _parsers.getParser)(parsedOptions.parser);
  var logger = new _logger2['default'](parsedOptions.color);

  function handleTestEnd(status) {
    var output = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var pastSpecs = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (status === 0) {
      callback(status);
    } else {
      if (++testAttempt <= parsedOptions.maxAttempts) {
        logger.log('info', '\nUsing ' + parser.name + ' to parse output\n');
        var failedSpecs = parser.parse(output);

        logger.log('info', 'Re-running tests: test attempt ' + testAttempt + '\n');
        if (parsedOptions.protractorRetryConfig) {
          logger.log('info', 'Using provided protractorRetryConfig: ' + parsedOptions.protractorRetryConfig + '\n');
        }
        if (failedSpecs.length === 0 && parsedOptions.allowRestartAllSpecs) {
          logger.log('info', '\nTests failed but no specs were found. Specs from past attempt will be run again.\n\n');
          failedSpecs = pastSpecs;
        } else if (failedSpecs.length === 0 && !parsedOptions.allowRestartAllSpecs) {
          logger.log('info', '\nTests failed but no specs were found. Ending.');
          return;
        } else {
          logger.log('info', 'Re-running the following test files:\n');
          logger.log('info', failedSpecs.join('\n') + '\n');
        }
        return startProtractor(failedSpecs, true);
      }

      callback(status, output);
    }
  }

  function startProtractor() {
    var specFiles = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var retry = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var output = '';
    var protractorArgs = [parsedOptions.protractorPath].concat(parsedOptions.protractorArgs);

    protractorArgs.push('--params.flake.iteration', testAttempt);
    if (retry) {
      protractorArgs.push('--params.flake.retry', true);
    }

    if (specFiles.length) {
      protractorArgs = filterArgs(protractorArgs);
      protractorArgs.push('--specs', specFiles.join(','));
    }

    if (parsedOptions.protractorRetryConfig && retry) {
      protractorArgs.push(parsedOptions.protractorRetryConfig);
    }

    var protractor = (0, _child_process.spawn)(parsedOptions.nodeBin, protractorArgs, parsedOptions.protractorSpawnOptions);

    protractor.stdout.on('data', function (buffer) {
      var text = buffer.toString();
      logger.protractor(text);
      output = output + text;
    });

    protractor.stderr.on('data', function (buffer) {
      var text = buffer.toString();
      logger.protractor(text);
      output = output + text;
    });

    protractor.on('exit', function (status) {
      handleTestEnd(status, output, specFiles);
    });
  }

  startProtractor();
};

module.exports = exports['default'];