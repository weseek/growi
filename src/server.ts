import { Configuration, Inject, PlatformApplication } from '@tsed/common';
import { GlobalAcceptMimesMiddleware } from '@tsed/platform-express';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import loggerFactory from '~/utils/logger';
import { SafeRedirectMiddleware } from './server/middlewares/safe-redirect';

const rootDir = __dirname;
const logger = loggerFactory('growi:Server');

@Configuration({
  rootDir,
  port: process.env.PORT || 3000,
  httpsPort: false,
  acceptMimes: ['application/json'],
  componentsScan: [
    /* eslint-disable no-template-curly-in-string */
    '${rootDir}/server/middlewares/**/*.ts',
    '${rootDir}/server/service/**/*.ts',
    /* eslint-enable no-template-curly-in-string */
  ],
})
export class Server {

  @Inject()
  app!: PlatformApplication<Express.Application>;

  @Configuration()
  settings!: Configuration;

  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    this.app
      .use(GlobalAcceptMimesMiddleware)
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

}
