import { Service, Constant } from '@tsed/di';
import { Env } from '@tsed/core';

import next from 'next';
import Server from 'next/dist/next-server/server/next-server';

/**
 * A service for bridging Next.js and Ts.ED
 */
@Service()
export default class NextService {

  @Constant('env')
  private env!: Env;

  private _app!: Server;

  public get app(): Server {
    return this._app;
  }

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    const dev = this.env !== Env.PROD;
    this._app = next({ dev });

    return this._app.prepare();
  }

}
