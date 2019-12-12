/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

require('module-alias/register');

const { URL } = require('url');

const { getMongoUri } = require('@commons/util/mongoose-utils');

const mongoUri = getMongoUri();

// parse url
const url = new URL(mongoUri);

const authStr = (url.username.length > 0 && url.password.length > 0)
  ? `${url.username}:${url.password}@`
  : '';

const mongodb = {
  url: `${url.protocol}//${authStr}${url.host}${url.search}`,
  databaseName: url.pathname.substring(1), // omit heading slash
  options: {
    useNewUrlParser: true, // removes a deprecation warning when connecting
  },
};

module.exports = {
  mongoUri,
  mongodb,
  migrationsDir: 'src/migrations/',
  changelogCollectionName: 'migrations',
};
