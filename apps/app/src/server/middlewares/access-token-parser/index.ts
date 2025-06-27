import type { Scope } from '@growi/core/dist/interfaces';
import type { NextFunction, Response } from 'express';

import { parserForAccessToken } from './access-token';
import { parserForApiToken } from './api-token';
import type { AccessTokenParserReq } from './interfaces';

export type AccessTokenParser = (scopes?: Scope[], opts?: {acceptLegacy: boolean})
  => (req: AccessTokenParserReq, res: Response, next: NextFunction) => Promise<void>

export const accessTokenParser: AccessTokenParser = (scopes, opts) => {
  return async(req, res, next): Promise<void> => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    if (scopes == null || scopes.length === 0) {
      return next();
    }

    await parserForAccessToken(scopes)(req, res);

    if (opts?.acceptLegacy) {
      await parserForApiToken(req, res);
    }

    return next();
  };
};
