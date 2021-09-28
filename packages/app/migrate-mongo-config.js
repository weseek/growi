/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

const { URL } = require('url');

const { initMongooseGlobalSettings, getMongoUri, mongoOptions } = require('@growi/core');

initMongooseGlobalSettings();

const mongoUri = getMongoUri();
const migrationsDir = process.env.MIGRATIONS_DIR;

if (migrationsDir == null) {
  throw new Error('An env var MIGRATIONS_DIR must be set.');
}

// parse url
const url = new URL(mongoUri);

const mongodb = {
  url: mongoUri,
  databaseName: url.pathname.substring(1), // omit heading slash
  options: mongoOptions,
};

module.exports = {
  mongoUri,
  mongodb,
  migrationsDir,
  changelogCollectionName: 'migrations',
};
