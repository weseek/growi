import { Configuration, Inject, InjectorService } from '@tsed/di';
import { HttpServer, PlatformApplication } from '@tsed/common';
import '@tsed/platform-express'; // !! DO NOT MODIFY !!
import '@tsed/typeorm'; // !! DO NOT MODIFY !! -- https://github.com/tsedio/tsed/issues/1332#issuecomment-837840612
import '@tsed/swagger';

import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import helmet from 'helmet';
import { Express } from 'express';
import expressBunyanLogger from 'express-bunyan-logger';
import gracefulExit from 'express-graceful-exit';

import { ConnectionOptions } from 'typeorm';
import { createTerminus } from '@godaddy/terminus';

import swaggerSettingsForDev from '~/config/swagger/config.dev';
import swaggerSettingsForProd from '~/config/swagger/config.prod';
import { GlobalHttpErrorHandlingMiddleware } from './middlewares/GlobalHttpErrorHandlingMiddleware';
import './filters/CustomHttpErrorFilter';
import './filters/ResourceNotFoundFilter';
import loggerFactory from '~/utils/logger';

export const rootDir = __dirname;
const isProduction = process.env.NODE_ENV === 'production';

const logger = loggerFactory('slackbot-proxy:server');


const connectionOptions: ConnectionOptions = {
  // The 'name' property must be set. Otherwise, the 'name' will be '0' and won't work well. -- 2021.04.05 Yuki Takei
  // see: https://github.com/TypedProject/tsed/blob/7630cda20a1f6fa3a692ecc3e6cd51d37bc3c45f/packages/typeorm/src/utils/createConnection.ts#L10
  name: 'default',
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  database: process.env.TYPEORM_DATABASE,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  synchronize: true,
} as ConnectionOptions;

const swaggerSettings = isProduction ? swaggerSettingsForProd : swaggerSettingsForDev;
const helmetOptions = isProduction ? {} : {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
      scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
    },
  },
};

@Configuration({
  rootDir,
  acceptMimes: ['application/json'],
  httpPort: process.env.PORT || 8080,
  httpsPort: false, // CHANGE
  // disable RequestLogger of @tsed/logger
  logger: { logRequest: false },
  mount: {
    '/': [
      `${rootDir}/controllers/*.ts`,
      `${rootDir}/middlewares/*.ts`,
    ],
  },
  middlewares: [
    helmet(helmetOptions),
  ],
  componentsScan: [
    `${rootDir}/services/*.ts`,
  ],
  typeorm: [
    {
      ...connectionOptions,
      entities: [
        `${rootDir}/entities/*{.ts,.js}`,
      ],
      migrations: [
        `${rootDir}/migrations/*{.ts,.js}`,
      ],
      subscribers: [
        `${rootDir}/subscribers/*{.ts,.js}`,
      ],
    } as ConnectionOptions,
  ],
  swagger: swaggerSettings,
  exclude: [
    '**/*.spec.ts',
  ],
  viewsDir: `${rootDir}/views`,
  views: {
    root: `${rootDir}/views`,
    viewEngine: 'ejs',
    extensions: {
      ejs: 'ejs',
    },
  },
  statics: {
    '/': [
      {
        root: `${rootDir}/public`,
      },
    ],
  },
})
export class Server {

  @Inject()
  app: PlatformApplication<Express>;

  @Configuration()
  settings: Configuration;

  @Inject()
  injector: InjectorService;

  $beforeInit(): Promise<any> | void {
    const serverUri = process.env.SERVER_URI;

    if (serverUri === undefined) {
      throw new Error('The environment variable \'SERVER_URI\' must be defined.');
    }

    const server = this.injector.get<HttpServer>(HttpServer);

    // init express-graceful-exit
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    gracefulExit.init(server!);
  }

  $beforeRoutesInit(): void {
    const expressApp = this.app.getApp();

    this.app
      .use(gracefulExit.middleware(expressApp))
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true,
      }));

    this.setupLogger();
  }

  $afterRoutesInit(): void {
    this.app.use(GlobalHttpErrorHandlingMiddleware);
  }

  $beforeListen(): void {
    const expressApp = this.app.getApp();
    const server = this.injector.get<HttpServer>(HttpServer);

    // init terminus
    createTerminus(server, {
      onSignal: async() => {
        logger.info('server is starting cleanup');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        gracefulExit.gracefulExitHandler(expressApp, server!);
      },
      onShutdown: async() => {
        logger.info('cleanup finished, server is shutting down');
      },
    });
  }

  /**
   * Setup logger for requests
   */
  private setupLogger(): void {
    // use bunyan
    if (isProduction) {
      const logger = loggerFactory('express');

      this.app.use(expressBunyanLogger({
        logger,
        excludes: ['*'],
      }));
    }
    // use morgan
    else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const morgan = require('morgan');
      this.app.use(morgan('dev'));
    }
  }

}
