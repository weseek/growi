import { Env } from '@tsed/core';
import {
  Configuration, Inject, PlatformApplication, Value,
} from '@tsed/common';

import next from 'next';

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';
import { SafeRedirectMiddleware } from './middlewares/safe-redirect';
import { getMongoUri, mongoOptions } from './util/mongoose-utils';

import { NextCtrl } from './controllers/next';

const rootDir = __dirname;
const logger = loggerFactory('growi:Server');

const acceptMimes = process.env.NODE_ENV === Env.PROD
  ? ['application/json']
  : ['application/json', 'text/event-stream'];

@Configuration({
  rootDir,
  port: process.env.PORT || 3000,
  httpsPort: false,
  acceptMimes,
  componentsScan: [
    /* eslint-disable no-template-curly-in-string */
    '${rootDir}/middlewares/**/*.ts',
    '${rootDir}/service/**/*.ts',
    /* eslint-enable no-template-curly-in-string */
  ],
  mount: {
    '/': [
      NextCtrl,
    ],
  },
  mongoose: [ // @tsed/mongoose format configuration
    {
      id: 'default',
      url: getMongoUri(),
      connectionOptions: mongoOptions,
    },
  ],
})
export class Server {

  @Inject()
  app!: PlatformApplication<Express.Application>;

  @Value('mongoose')
  mongooseConfig!: any[];

  $beforeInit(): void | Promise<any> {
    return this.initMongoose();
  }

  private initMongoose(): Promise<typeof mongoose> {
    // initialize mongoose without @tsed/mongoose
    //  because mongoose.model() does not work when using @tsed/mongoose
    const { url, connectionOptions } = this.mongooseConfig[0];
    return mongoose.connect(url, connectionOptions);
  }

  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    this.app
      .use(helmet())
      .use(cookieParser())
      .use(methodOverride())
      .use(express.json({ limit: '50mb' }))
      .use(express.urlencoded({ extended: true, limit: '50mb' }))
      .use(SafeRedirectMiddleware);

    const { raw: expressApp } = this.app;
    this.setupSession(expressApp);
  }

  private setupSession(app: Express.Application): void {
    logger.info('Setup session');
  }

  // public async $afterRoutesInit(): Promise<void> {
  //   const { raw: expressApp } = this.app;
  //   await this.setupNextApp(expressApp);
  // }

  // private async setupNextApp(expressApp: Express.Application): Promise<void> {
  //   const dev = process.env.NODE_ENV !== 'production';
  //   const nextApp = next({ dev });

  //   await nextApp.prepare();

  //   const handle = nextApp.getRequestHandler();

  //   this.router.get('/*', (req, res) => {
  //     // req.crowi = this;
  //     return handle(req, res);
  //   });
  // }

}
