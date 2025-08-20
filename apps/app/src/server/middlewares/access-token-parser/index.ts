import type { Scope } from '@growi/core/dist/interfaces';
import type { NextFunction, Response } from 'express';

import loggerFactory from '~/utils/logger';

import { parserForAccessToken } from './access-token';
import { parserForApiToken } from './api-token';
import type { AccessTokenParserReq } from './interfaces';

const logger = loggerFactory('growi:middleware:access-token-parser');

export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (authHeader == null) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};


export type AccessTokenParser = (scopes?: Scope[], opts?: {acceptLegacy: boolean})
  => (req: AccessTokenParserReq, res: Response, next: NextFunction) => Promise<void>

export const accessTokenParser: AccessTokenParser = (scopes, opts) => {
  return async(req, res, next): Promise<void> => {
    // Extract token from Authorization header first
    const bearerToken = extractBearerToken(req.headers.authorization);

    // Try all possible token sources in order of priority
    const accessToken = bearerToken ?? req.query.access_token ?? req.body.access_token;
    if (accessToken == null || typeof accessToken !== 'string') {
      return;
    }

    logger.debug('accessToken is', accessToken);

    if (scopes == null || scopes.length === 0) {
      logger.warn('scopes is empty');
      return next();
    }

    await parserForAccessToken(accessToken, scopes)(req, res);

    if (opts?.acceptLegacy) {
      await parserForApiToken(accessToken)(req, res);
    }

    return next();
  };
};
