/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

require('module-alias/register');

const { getMongoUri } = require('@commons/util/mongoose-utils');

const mongoUri = getMongoUri();
const match = mongoUri.match(/^(.+)\/([^/]+)$/);

module.exports = {
  mongoUri,
  mongodb: {
    url: match[0],
    databaseName: match[2],
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
    },
  },
  migrationsDir: 'src/migrations/',
  changelogCollectionName: 'migrations',
};
