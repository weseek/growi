import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:unavailable-when-maintenance-mode');

type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = Request & {
  crowi: Crowi,
}

export const generateUnavailableWhenMaintenanceModeMiddleware = crowi => async(req: CrowiReq, res: Response, next: NextFunction): Promise<void> => {
  const isMaintenanceMode = crowi.appService.isMaintenanceMode();

  if (!isMaintenanceMode) {
    next();
    return;
  }

  const { nextApp } = crowi;
  req.crowi = crowi;
  nextApp.render(req, res, '/maintenance');
};

export const generateUnavailableWhenMaintenanceModeMiddlewareForApi = crowi => async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const isMaintenanceMode = crowi.appService.isMaintenanceMode();

  if (!isMaintenanceMode) {
    next();
    return;
  }

  res.status(503).json({ error: 'GROWI is under maintenance.' });
};
