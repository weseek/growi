import type { Request, Response } from 'express';
import { query } from 'express-validator';
import { FilterXSS } from 'xss';

import type { LsxApiOptions } from '../interfaces/api';

import { listPages } from './routes/list-pages';


const loginRequiredFallback = (req: Request, res: Response) => {
  return res.status(403).send('login required');
};

const filterXSS = new FilterXSS();

const lsxValidator = [
  query('pagePath').notEmpty().isString(),
  query('offset').optional().isNumeric(),
  query('limit').optional().isNumeric(),
  query('options')
    .optional()
    .customSanitizer((options) => {
      try {
        const jsonData: LsxApiOptions = JSON.parse(options);

        Object.keys(jsonData).forEach((key) => {
          jsonData[key] = filterXSS.process(jsonData[key]);
        });

        return jsonData;
      }
      catch (err) {
        throw new Error('Invalid JSON format in options');
      }
    }),
  query('options.*').optional().isString(),
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const middleware = (crowi: any, app: any): void => {
  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api/lsx', accessTokenParser, loginRequired, lsxValidator, listPages);
};

export default middleware;
