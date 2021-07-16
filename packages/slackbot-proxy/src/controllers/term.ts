import { Controller, PlatformRouter } from '@tsed/common';
import { Request, Response } from 'express';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Controller('/term')
export class TermCtrl {

  constructor(router: PlatformRouter) {
    if (isOfficialMode) {
      router.get('/', this.getTerm);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getTerm(req: Request, res: Response): string|void {
    res.render('term.ejs');
  }

}
