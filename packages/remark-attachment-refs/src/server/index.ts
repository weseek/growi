import { routesFactory } from './routes/refs';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const middleware = (crowi: any, app: any): void => {
  const refs = routesFactory(crowi);

  app.use('/_api/attachment-refs', refs);
};

export default middleware;
