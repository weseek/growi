import type { NextFunction, Response } from 'express';

import type { Scope } from '~/interfaces/scope';

import { parserForAccessToken } from './access-token';
import { parserForApiToken } from './api-token';
import type { AccessTokenParserReq } from './interfaces';

export const accessTokenParser = (scopes: Scope[]) => {
  return async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer

    parserForAccessToken(scopes)(req, res, next);
    parserForApiToken(req, res, next);

    return next();
  };
};
