import { Configuration, Inject, PlatformApplication } from '@tsed/common';
import { GlobalAcceptMimesMiddleware } from '@tsed/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

const rootDir = __dirname;

@Configuration({
  rootDir,
  port: process.env.PORT || 3000,
  httpsPort: false,
  acceptMimes: ['application/json'],
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
      .use(GlobalAcceptMimesMiddleware) // optional
      .use(cookieParser())
      .use(methodOverride())
      .use(express.json())
      .use(express.urlencoded({
        extended: true,
      }));
  }

}
