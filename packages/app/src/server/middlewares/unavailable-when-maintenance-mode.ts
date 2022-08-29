import { NextFunction, Request, Response } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:unavailable-when-maintenance-mode');

// export const generateUnavailableWhenMaintenanceModeMiddleware = crowi => async(req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const isMaintenanceMode = crowi.appService.isMaintenanceMode();

//   if (!isMaintenanceMode) {
//     next();
//     return;
//   }

//   res.render('maintenance-mode');
// };

export const generateUnavailableWhenMaintenanceModeMiddlewareForApi = crowi => async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const isMaintenanceMode = crowi.appService.isMaintenanceMode();

  if (!isMaintenanceMode) {
    next();
    return;
  }

  res.status(503).json({ error: 'GROWI is under maintenance.' });
};
