import type { Request, Response } from 'express';
import { query } from 'express-validator';

import type { LsxApiOptions } from '../interfaces/api';

import { listPages } from './routes/list-pages';


const loginRequiredFallback = (req: Request, res: Response) => {
  return res.status(403).send('login required');
};

const escapeSpecialCharacters = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const lsxValidator = [
  query('options')
    .customSanitizer((options) => {
      try {
        const jsonData: LsxApiOptions = JSON.parse(options);

        Object.keys(jsonData).forEach((key) => {
          jsonData[key] = escapeSpecialCharacters(jsonData[key]);
        });

        return jsonData;
      }
      catch (err) {
        throw new Error('Invalid JSON format in options');
      }
    }),
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const middleware = (crowi: any, app: any): void => {
  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api/lsx', accessTokenParser, loginRequired, lsxValidator, listPages);
};

export default middleware;
