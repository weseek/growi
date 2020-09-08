import {
  Controller, Get, Constant,
  Req, Res, Request, Response,
} from '@tsed/common';
import next from 'next';
import Server from 'next/dist/next-server/server/next-server';
import { Env } from '@tsed/core';

@Controller('/')
export class NextCtrl {

  @Constant('env')
  private env!: Env;

  private nextApp!: Server;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    const dev = process.env.NODE_ENV !== 'production';
    this.nextApp = next({ dev });

    return this.nextApp.prepare();
  }

  @Get('/*')
  get(@Req() req: Request, @Res() res: Response): Promise<void> {
    const handle = this.nextApp.getRequestHandler();
    return handle(req, res);
  }

  /**
   * For HMR
   * @param req
   * @param res
   */
  @Get('/_next/webpack-hmr')
  hmr(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (this.env !== Env.DEV) {
      return res.status(403).send('webpack-hmr is enabled only when development');
    }

    const handle = this.nextApp.getRequestHandler();
    return handle(req, res);
  }

}
