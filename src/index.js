import {spawn} from 'child_process'
import {getParser} from './parsers'
import parseOptions from './parse-options'
import 'core-js/shim'
import Logger from './logger'

function filterArgs (protractorArgs) {
  protractorArgs = protractorArgs.filter((arg) => !/^--(suite|specs)=/.test(arg));
  ['--suite', '--specs'].forEach((item) => {
    let index = protractorArgs.indexOf(item)
    if (index !== -1) {
      protractorArgs.splice(index, 2)
    }
  })
  return protractorArgs
}

export default function (options = {}, callback = function noop () {}) {
  let testAttempt = 1
  let parsedOptions = parseOptions(options)
  let parser = getParser(parsedOptions.parser)
  let logger = new Logger(parsedOptions.color)

  function handleTestEnd (status, output = '', pastSpecs = []) {
    if (status === 0) {
      callback(status)
    } else {
      if (++testAttempt <= parsedOptions.maxAttempts) {
        logger.log('info', `\nUsing ${parser.name} to parse output\n`)
        let failedSpecs = parser.parse(output)

        logger.log('info', `Re-running tests: test attempt ${testAttempt}\n`)
        if (parsedOptions.protractorRetryConfig) {
          logger.log('info', `Using provided protractorRetryConfig: ${parsedOptions.protractorRetryConfig}\n`)
        }
        if (failedSpecs.length === 0 && parsedOptions.allowRestartAllSpecs) {
          logger.log('info', '\nTests failed but no specs were found. Specs from past attempt will be run again.\n\n')
          failedSpecs = pastSpecs
        } else if (failedSpecs.length === 0 && !parsedOptions.allowRestartAllSpecs) {
          logger.log('info', '\nTests failed but no specs were found. Ending.')
          return
        } else {
          logger.log('info', 'Re-running the following test files:\n')
          logger.log('info', failedSpecs.join('\n') + '\n')
        }
        return startProtractor(failedSpecs, true)
      }

      callback(status, output)
    }
  }

  function startProtractor (specFiles = [], retry = false) {
    let output = ''
    let protractorArgs = [parsedOptions.protractorPath].concat(parsedOptions.protractorArgs)

    protractorArgs.push('--params.flake.iteration', testAttempt)
    if (retry) {
      protractorArgs.push('--params.flake.retry', true)
    }

    if (specFiles.length) {
      protractorArgs = filterArgs(protractorArgs)
      protractorArgs.push('--specs', specFiles.join(','))
    }

    if (parsedOptions.protractorRetryConfig && retry) {
      protractorArgs.push(parsedOptions.protractorRetryConfig)
    }

    let protractor = spawn(
      parsedOptions.nodeBin,
      protractorArgs,
      parsedOptions.protractorSpawnOptions
    )

    protractor.stdout.on('data', (buffer) => {
      let text = buffer.toString()
      logger.protractor(text)
      output = output + text
    })

    protractor.stderr.on('data', (buffer) => {
      let text = buffer.toString()
      logger.protractor(text)
      output = output + text
    })

    protractor.on('exit', function (status) {
      handleTestEnd(status, output, specFiles)
    })
  }

  startProtractor()
}
