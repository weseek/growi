import next from 'next';
import Server from 'next/dist/next-server/server/next-server';

import express, { Request, Response } from 'express';
import Logger from 'bunyan';

import loggerFactory from '~/utils/logger';
import { hasProcessFlag } from '~/utils/process-utils';

const logger: Logger = loggerFactory('growi');

const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp: Server = next({ dev });
const handle = nextApp.getRequestHandler();
const port: string | number = process.env.PORT || 3000;

async function main() {
  try {
    await nextApp.prepare();

    const app = express();
    app.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });
    const server = app.listen(port, (err?: Error) => {
      if (err) throw err;
      logger.info(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });

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

process.on('uncaughtException', (err?: Error) => {
  logger.error('Uncaught Exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});

main();
