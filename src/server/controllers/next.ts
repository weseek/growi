import {
  Controller, Get, Constant,
  Req, Res, Request, Response, Inject,
} from '@tsed/common';
import { Env } from '@tsed/core';

import NextService from '../service/next';

@Controller('/')
export class NextCtrl {

  @Constant('env')
  private env!: Env;

  @Inject()
  private nextService!: NextService;

  @Get('/*')
  get(@Req() req: Request, @Res() res: Response): Promise<void> {
    const handle = this.nextService.app.getRequestHandler();
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

    const handle = this.nextService.app.getRequestHandler();
    return handle(req, res);
  }

}
