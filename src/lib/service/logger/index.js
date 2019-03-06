const bunyan = require('bunyan'); // will be replaced to browser-bunyan on browser by webpack
const minimatch = require('minimatch');

const isBrowser = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const config = require('@root/config').logger;
const stream = isProd ? require('./stream.prod') : require('./stream.dev');

// logger store
const loggers = {};


// merge configuration from environment variables
const envLevelMap = {
  INFO:   'info',
  DEBUG:  'debug',
  WARN:   'warn',
  TRACE:  'trace',
  ERROR:  'error',
};
Object.keys(envLevelMap).forEach((envName) => { // ['INFO', 'DEBUG', ...].forEach
  const envVars = process.env[envName]; // process.env.DEBUG should have a value like 'growi:routes:page,growi:models.page,...'
  if (envVars != null) {
    const level = envLevelMap[envName];
    envVars.split(',').forEach((ns) => { // ['growi:routes:page', 'growi:models.page', ...].forEach
      config[ns.trim()] = level;
    });
  }
});


/**
 * determine logger level
 * @param {string} name Logger name
 */
function determineLoggerLevel(name) {
  if (isBrowser && isProd) {
    return 'error';
  }

  let level = config.default;

  /* eslint-disable array-callback-return, no-useless-return */
  // retrieve configured level
  Object.keys(config).some((key) => { //  breakable forEach
    // test whether 'name' matches to 'key'(blob)
    if (minimatch(name, key)) {
      level = config[key];
      return; //                          break if match
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
