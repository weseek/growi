import type { Request, Response } from 'express';

import { listPages } from './routes/list-pages';

const loginRequiredFallback = (req: Request, res: Response) => {
  return res.status(403).send('login required');
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const middleware = (crowi: any, app: any): void => {
  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api/lsx', accessTokenParser, loginRequired, listPages);
};

export default middleware;
