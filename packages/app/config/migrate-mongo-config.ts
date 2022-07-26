/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

import { URL } from 'url';

import { initMongooseGlobalSettings, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';

// get migrationsDir from env var
const migrationsDir = process.env.MIGRATIONS_DIR;
if (migrationsDir == null) {
  throw new Error('An env var MIGRATIONS_DIR must be set.');
}


initMongooseGlobalSettings();

const mongoUri = getMongoUri();

// parse url
const url = new URL(mongoUri);

const mongodb = {
  url: mongoUri,
  databaseName: url.pathname.substring(1), // omit heading slash
  options: mongoOptions,
};

module.exports = {
  mongodb,
  migrationsDir,
  changelogCollectionName: 'migrations',
};
