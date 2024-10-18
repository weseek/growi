import type { PlatformApplication } from '@tsed/common';
import { Configuration, Inject } from '@tsed/di';
import express from 'express';
import '@tsed/swagger';

import * as Controllers from './controllers';

import '@tsed/platform-express';

const PORT = Number(process.env.PORT || 3004);

@Configuration({
  port: PORT,
  acceptMimes: ['application/json'],
  mount: {
    '/': [...Object.values(Controllers)],
  },
  middlewares: ['json-parser'],
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

  $beforeRoutesInit(): void {
    this.app
      .use(express.json({ limit: '50mb' }))
      .use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

}

export default Server;
