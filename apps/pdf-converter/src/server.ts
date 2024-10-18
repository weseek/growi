import type { PlatformApplication } from '@tsed/common';
import { Configuration, Inject } from '@tsed/di';
import bodyParser from 'body-parser';

import * as Controllers from './controllers';

import '@tsed/platform-express';

const PORT = Number(process.env.PORT || 3004);

@Configuration({
  port: PORT,
  acceptMimes: ['application/json'],
  mount: {
    '/': [...Object.values(Controllers)],
  },
  middlewares: [
    'json-parser',
    bodyParser.json({ limit: '50mb' }),
    bodyParser.urlencoded({ extended: true, limit: '50mb' }),
  ],
  swagger: [
    {
      path: '/v3/docs',
      specVersion: '3.0.1',
    },
  ],
})
class Server {

  @Inject()
    app: PlatformApplication;

}

export default Server;
