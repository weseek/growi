/**
 * Growi::app.js
 *
 * @package growi
 * @author  Yuki Takei <yuki@weseek.co.jp>
 */

require('module-alias/register');

const logger = require('@alias/logger')('growi');
const helpers = require('@commons/util/helpers');
const growi = new (require('./crowi'))(helpers.root(), process.env);


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
  .then(express => {
    if (helpers.hasProcessFlag('ci')) {
      logger.info('"--ci" flag is detected. Exit process.');
      express.close(() => {
        process.exit();
      });
    }
  })
  .catch(err => {
    logger.error('An error occurred, unable to start the server');
    logger.error(err);
    process.exit(1);
  });
