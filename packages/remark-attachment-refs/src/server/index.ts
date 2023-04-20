import { routesFactory } from './routes/refs';

const loginRequiredFallback = (req, res) => {
  return res.status(403).send('login required');
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const middleware = (crowi: any, app: any): void => {
  const refs = routesFactory(crowi);

  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api', accessTokenParser, loginRequired, refs);
};

export default middleware;
