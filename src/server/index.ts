import next from 'next';
import Server from 'next/dist/next-server/server/next-server';

import express, { Request, Response } from 'express';
import { ParsedUrlQuery } from 'querystring';
import Logger from 'bunyan';

import loggerFactory from '~/utils/logger';

const logger: Logger = loggerFactory('growi');

const dev: boolean = process.env.NODE_ENV !== 'production';
const app: Server = next({ dev });
const handle = app.getRequestHandler();
const port: string | number = process.env.PORT || 3000;

function installErrorHandler(app: Server) {
  const _renderErrorToHTML = app.renderErrorToHTML.bind(app);

  app.renderErrorToHTML = (err: Error, req: Request, res: Response, pathname: string, query: ParsedUrlQuery) => {
    if (err) {
      console.error(err);
    }

    return _renderErrorToHTML(err, req, res, pathname, query);
  };

  return app;
}

async function main() {
  try {
    await app.prepare();

    // TODO: set error handler
    // https://github.com/vercel/next.js/issues/1852#issuecomment-353671222
    installErrorHandler(app);

    const server = express();
    server.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });
    server.listen(port, (err?: Error) => {
      if (err) throw err;
      logger.info(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
