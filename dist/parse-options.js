'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var DEFAULT_OPTIONS = {
  nodeBin: 'node',
  maxAttempts: 3,
  protractorArgs: [],
  // set color to one of the colors available at 'chalk' - https://github.com/chalk/ansi-styles#colors
  // set false to disable coloring
  color: 'magenta',
  // the name of one of the included parsers
  // a function to be used as a parser
  // or the path to a node module that exports a parser
  parser: 'standard',
  // specify a different protractor config to apply after the first execution attempt
  // either specify a config file, or cli args (ex. --capabilities.browser=chrome)
  protractorRetryConfig: undefined,
  // if no specs are found to be failing, restart past attempt specs if true
  allowRestartAllSpecs: true
};

function parseOptions(providedOptions) {
  var options = Object.assign({}, DEFAULT_OPTIONS, providedOptions);

  // normalizing options.color to be a boolean or a color value
  if (!(options.color in _chalk2['default'])) {
    if (options.color === false || options.color === 'false') {
      options.color = false;
    } else {
      throw new Error('Invalid color option. Color must be one of the supported chalk colors: https://github.com/chalk/ansi-styles#colors');
    }
  }

  if (options.protractorRetryConfig) {
    var configPath = (0, _path.resolve)(options.protractorRetryConfig);
    try {
      fs.lstatSync(configPath).isFile();
      options.protractorRetryConfig = configPath;
    } catch (e) {
      // do nothing, not a config path
    }
  }

  if (options.protractorPath) {
    options.protractorPath = (0, _path.resolve)(options.protractorPath);
  } else {
    // '.../node_modules/protractor/lib/protractor.js'
    var protractorMainPath = require.resolve('protractor');
    // '.../node_modules/protractor/bin/protractor'
    options.protractorPath = (0, _path.resolve)(protractorMainPath, '../../bin/protractor');
  }

  return options;
}

exports['default'] = parseOptions;
module.exports = exports['default'];