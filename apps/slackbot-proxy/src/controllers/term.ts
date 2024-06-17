import type { PlatformRouter } from '@tsed/common';
import { Controller } from '@tsed/common';
import type { Request, Response } from 'express';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Controller('/term')
export class TermCtrl {

  constructor(router: PlatformRouter) {
    if (isOfficialMode) {
      router.get('/', this.getTerm);
    }
  }

  getTerm(req: Request, res: Response): string|void {
    res.render('term.ejs');
  }

}
