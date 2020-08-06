import bunyan from 'bunyan'; // will be replaced to browser-bunyan on browser by webpack
import minimatch from 'minimatch';

import { logger as configOfLogger } from '@root/config';

const isBrowser = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const stream = isProd ? require('./stream.prod') : require('./stream.dev');

// logger store
interface BunyanStore {
  [key: string] : bunyan;
}
const loggers: BunyanStore = {};


// merge configuration from environment variables
interface EnvLevelMap {
  [key: string] : string;
}
const envLevelMap: EnvLevelMap = {
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
      configOfLogger[ns.trim()] = level;
    });
  }
});


/**
 * determine logger level
 * @param {string} name Logger name
 */
function determineLoggerLevel(name: string) {
  if (isBrowser && isProd) {
    return 'error';
  }

  let level = configOfLogger.default;

  /* eslint-disable array-callback-return, no-useless-return */
  // retrieve configured level
  Object.keys(configOfLogger).some((key) => { //  breakable forEach
    // test whether 'name' matches to 'key'(blob)
    if (minimatch(name, key)) {
      level = configOfLogger[key];
      return; //                          break if match
    }
  });

  return level;
}

export default function(name: string): bunyan {
  // create logger instance if absent
  if (loggers[name] == null) {
    loggers[name] = bunyan.createLogger({
      name,
      stream,
      level: determineLoggerLevel(name),
    });
  }

  return loggers[name];
}
