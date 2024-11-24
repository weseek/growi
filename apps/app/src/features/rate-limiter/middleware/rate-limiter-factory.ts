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

    if (this.rateLimiters.has(key)) {
      const instance = this.rateLimiters.get(key);
      if (instance != null) {
        return instance;
      }
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
