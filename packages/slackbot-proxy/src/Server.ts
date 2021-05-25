import { Configuration, Inject, InjectorService } from '@tsed/di';
import { PlatformApplication } from '@tsed/common';
import '@tsed/platform-express'; // /!\ keep this import
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import '@tsed/swagger';
import { TypeORMService } from '@tsed/typeorm';
import { ConnectionOptions } from 'typeorm';


export const rootDir = __dirname;

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

  @Inject()
  injector: InjectorService;

  $beforeInit(): Promise<any> | void {
    const serverUri = process.env.SERVER_URI;

    if (serverUri === undefined) {
      throw new Error('The environment variable \'SERVER_URI\' must be defined.');
    }
  }

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

  async $onReady(): Promise<void> {
    // for synchromizing when boot
    this.injector.get<TypeORMService>(TypeORMService);
  }

}
