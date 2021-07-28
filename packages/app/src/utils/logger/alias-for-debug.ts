import generateBunyanLogger from './index';
/**
 * return 'debug' method of bunyan logger
 *
 * This is supposed to be used as an replacement of "require('debug')"
 *
 * @param {string} name
 */
module.exports = (name: string) => {
  const bunyanLogger = generateBunyanLogger(name);
  return bunyanLogger.debug.bind(bunyanLogger);
};
