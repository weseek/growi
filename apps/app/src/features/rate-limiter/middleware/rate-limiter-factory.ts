import { connection } from 'mongoose';
import { type IRateLimiterMongoOptions, RateLimiterMongo } from 'rate-limiter-flexible';

import { DEFAULT_DURATION_SEC } from '../config';

class RateLimiterFactory {

  private rateLimiters: Map<string, RateLimiterMongo> = new Map();

  private generateKey(endpoint: string): string {
    return `rate_limiter_${endpoint}`;
  }

  getOrCreateRateLimiter(endpoint: string, maxRequests: number): RateLimiterMongo {
    const key = this.generateKey(endpoint);

    const cachedRateLimiter = this.rateLimiters.get(key);
    if (cachedRateLimiter != null) {
      return cachedRateLimiter;
    }

    const opts: IRateLimiterMongoOptions = {
      storeClient: connection,
      duration: DEFAULT_DURATION_SEC,
      points: maxRequests,
    };

    const rateLimiter = new RateLimiterMongo(opts);
    this.rateLimiters.set(key, rateLimiter);

    return rateLimiter;
  }

}

export const rateLimiterFactory = new RateLimiterFactory();
