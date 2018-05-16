/**
 * Growi::app.js
 *
 * @package growi
 * @author  Yuki Takei <yuki@weseek.co.jp>
 */

require('module-alias/register');

const logger = require('@alias/logger')('growi');
const growi = new (require('./lib/crowi'))(__dirname, process.env);


/************************************
 *          Main Process
 ***********************************/
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});

growi.start()
  .catch(err => {
    logger.error('An error occurred, unable to start the server');
    logger.error(err);
  });
