/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
// todo get url from mongoose-util
export const mongoUri = 'mongodb://mongo/growi';
export const migrationFileExtension = '.ts';
export const changelogCollectionName = 'migrations';
export const migrationsDir = 'src/migrations/';
export const mongodb = {
  url: 'mongodb://mongo/growi',
  databaseName: 'growi', // omit heading slash
  options: {
    useNewUrlParser: true, // removes a deprecation warning when connecting
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
