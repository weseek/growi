/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

import { initMongooseGlobalSettings, getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';

const { URL } = require('url');

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
  mongoUri,
  mongodb,
  changelogCollectionName: 'migrations',
};
