const bunyan = require('bunyan');   // will be replaced to browser-bunyan on browser by webpack
const minimatch = require('minimatch');

const isBrowser = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const config = require('@root/config').logger;

let stream = isProd ? require('./stream.prod') : require('./stream.dev');

// logger store
let loggers = {};

/**
 * determine logger level
 * @param {string} name Logger name
 */
function determineLoggerLevel(name) {
  if (isBrowser && isProd) {
    'error';
  }

  let level = config.default;

  // retrieve configured level
  Object.keys(config).some(key => { // breakable forEach
    // test whether 'name' matches to 'key'(blob)
    if (minimatch(name, key)) {
      level = config[key];
      return;                       // break if match
    }
  });

  return level;
}

module.exports = (name) => {
  // create logger instance if absent
  if (loggers[name] == null) {
    loggers[name] = bunyan.createLogger({
      name,
      stream,
      level: determineLoggerLevel(name),
    });
  }

  return loggers[name];
};
