import { connection } from 'mongoose';
import { type IRateLimiterMongoOptions, RateLimiterMongo } from 'rate-limiter-flexible';

import { DEFAULT_DURATION_SEC } from '../config';

const opts: IRateLimiterMongoOptions = {
  storeClient: connection,
  duration: DEFAULT_DURATION_SEC, // set default value
};

export const rateLimiter = new RateLimiterMongo(opts);
