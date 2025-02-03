import type { NextFunction, Request, Response } from 'express';
import createError, { isHttpError } from 'http-errors';

import type Crowi from '../crowi';

export const generateCheckerMiddleware = (crowi: Crowi) => async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { appService } = crowi;

  const isDBInitialized = await appService.isDBInitialized(true);

  if (isDBInitialized) {
    return next(createError(409, 'Application is already installed'));
  }

  return next();
};

export const allreadyInstalledMiddleware = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  return next(createError(409, 'Application is already installed'));
};

export const handleAsApiError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error == null) {
    return next();
  }

  if (isHttpError(error)) {
    const httpError = error as createError.HttpError;
    res.status(httpError.status).json({ message: httpError.message });
    return;
  }

  next();
};

export const redirectToTopOnError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error != null) {
    return res.redirect('/');
  }
  return next();
};
