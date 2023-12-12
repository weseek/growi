import MongoStore from 'connect-mongo';
import connectRedis from 'connect-redis';
import { session } from 'express-session';
import mongoose from 'mongoose';
import redis from 'redis';
import uid from 'uid-safe';

import { configManager } from '../service/config-manager';

export interface SessionConfig {
  rolling: boolean;
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    maxAge: number | null;
  };
  genid(req: any): any;
  name?: string;
  store?: any;
}

export const setupSessionConfig = async(): Promise<SessionConfig> => {
  const sessionMaxAge = configManager.getConfig('crowi', 'security:sessionMaxAge') || 2592000000; // default: 30days
  const redisUrl = process.env.REDISTOGO_URL || process.env.REDIS_URI || process.env.REDIS_URL || null;

  // generate pre-defined uid for healthcheck
  const healthcheckUid = uid(24);

  const sessionConfig: SessionConfig = {
    rolling: true,
    secret: process.env.SECRET_TOKEN || 'this is default session secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: sessionMaxAge,
    },
    genid(req) {
      // return pre-defined uid when healthcheck
      if (req.path === '/_api/v3/healthcheck') {
        return healthcheckUid;
      }
      return uid(24);
    },
  };

  if (process.env.SESSION_NAME) {
    sessionConfig.name = process.env.SESSION_NAME;
  }

  // use Redis for session store
  if (redisUrl) {
    const redisClient = redis.createClient({ url: redisUrl });
    const RedisStore = connectRedis(session);
    sessionConfig.store = new RedisStore({ client: redisClient });
  }
  // use MongoDB for session store
  else {
    sessionConfig.store = MongoStore.create({ client: mongoose.connection.getClient() });
  }

  return sessionConfig;
};
