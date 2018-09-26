/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

function getMongoUri(env) {
  return env.MONGOLAB_URI || // for B.C.
    env.MONGODB_URI || // MONGOLAB changes their env name
    env.MONGOHQ_URL ||
    env.MONGO_URI ||
    ((env.NODE_ENV === 'test') ? 'mongodb://localhost/growi_test' : 'mongodb://localhost/growi');
}

const mongoUri = getMongoUri(process.env);
const match = mongoUri.match(/^(.+)\/([^/]+)$/);
module.exports = {
  mongoUri,
  mongodb: {
    url: match[1],
    databaseName: match[2],
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
    },
  },
  migrationsDir: 'resource/migrations',
  changelogCollectionName: 'migrations'
};
