import { Configuration, Inject } from '@tsed/di';
import { PlatformApplication } from '@tsed/common';
import '@tsed/platform-express'; // /!\ keep this import
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import '@tsed/swagger';
import '@tsed/typeorm';
import { ConnectionOptions } from 'typeorm';

export const rootDir = __dirname;

const connectionOptions: ConnectionOptions = {
  type: process.env.TYPEORM_CONNECTION,
  database: process.env.TYPEORM_DATABASE,
} as ConnectionOptions;
@Configuration({
  rootDir,
  acceptMimes: ['application/json'],
  httpPort: process.env.PORT || 8080,
  httpsPort: false, // CHANGE
  mount: {
    '/': [
      `${rootDir}/controllers/*.ts`,
      `${rootDir}/middlewares/*.ts`,
    ],
  },
  typeorm: [
    {
      ...connectionOptions,
      entities: [
        `${rootDir}/entity/*{.ts,.js}`,
      ],
      migrations: [
        `${rootDir}/migrations/*{.ts,.js}`,
      ],
      subscribers: [
        `${rootDir}/subscriber/*{.ts,.js}`,
      ],
    } as ConnectionOptions,
  ],
  swagger: [
    {
      path: '/docs',
      specVersion: '3.0.1',
    },
  ],
  exclude: [
    '**/*.spec.ts',
  ],
})
export class Server {

  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {
    this.app
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true,
      }));
  }

}
