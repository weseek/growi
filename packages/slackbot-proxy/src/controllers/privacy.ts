import { Controller, PlatformRouter } from '@tsed/common';
import { Request, Response } from 'express';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Controller('/privacy')
export class SlackCtrl {

  constructor(router: PlatformRouter) {
    if (isOfficialMode) {
      router.get('/', this.getPrivacy);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getPrivacy(req: Request, res: Response): string|void {
    res.send('Privary Policy');
  }

}
