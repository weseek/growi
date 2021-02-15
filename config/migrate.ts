/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

import { URL } from 'url';
import { getMongoUri } from '~/server/util/mongoose-utils';

export const mongoUri = getMongoUri();

// parse url
export const url = new URL(mongoUri);

export const mongodb = {
  url: mongoUri,
  databaseName: url.pathname.substring(1), // omit heading slash
  options: {
    useNewUrlParser: true, // removes a deprecation warning when connecting
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};

export const migrationsDir = 'src/migrations/';
export const changelogCollectionName = 'migrations';
export const migrationFileExtension = '.ts';
