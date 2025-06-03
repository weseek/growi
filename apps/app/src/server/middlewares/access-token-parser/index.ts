import type { NextFunction, Response } from 'express';

import type { Scope } from '~/interfaces/scope';

import { parserForAccessToken } from './access-token';
import { parserForApiToken } from './api-token';
import type { AccessTokenParserReq } from './interfaces';

export const accessTokenParser = (scopes?: Scope[], isLegacyAccessTokenEnabled = false) => {
  return async(req: AccessTokenParserReq, res: Response, next: NextFunction): Promise<void> => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    if (scopes == null || scopes.length === 0) {
      return next();
    }

    await parserForAccessToken(scopes)(req, res, next);

    if (isLegacyAccessTokenEnabled) {
      await parserForApiToken(req, res, next);
    }

    return next();
  };
};
