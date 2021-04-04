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
// import { ReceiveService } from './services/RecieveService';

export const rootDir = __dirname;

const connectionOptions: ConnectionOptions = {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  database: process.env.TYPEORM_DATABASE,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  synchronize: true,
  logging: true,
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

  // @Inject()
  // receiveService:ReceiveService

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
    const typeormService = this.injector.get<TypeORMService>(TypeORMService);
    console.log(typeormService);

    const connection = typeormService?.connectionManager.get('0');
    console.log(connection);
  }

}
