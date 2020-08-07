import path from 'path';
import Logger from 'bunyan';

import loggerFactory from '~/utils/logger';
import { hasProcessFlag } from '~/utils/process-utils';

const logger: Logger = loggerFactory('growi');


/** **********************************
 *          Main Process
 ********************************** */
process.on('uncaughtException', (err?: Error) => {
  logger.error('Uncaught Exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});

async function main() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Crowi = require('./crowi');
    const growi = new Crowi(path.resolve(__dirname, '../'));
    const server = await growi.start();

    if (hasProcessFlag('ci')) {
      logger.info('"--ci" flag is detected. Exit process.');
      server.close(() => {
        process.exit();
      });
    }
  }
  catch (err) {
    logger.error('An error occurred, unable to start the server');
    logger.error(err);
    process.exit(1);
  }
}

main();
