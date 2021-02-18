import { getMongoUri } from '~/server/util/mongoose-utils';

/**
 * Configuration file for migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo
 * @see https://github.com/seppevs/migrate-mongo/issues/79 about workaround of worktypescript
 */

const mongoUri = getMongoUri();
// parse url
const url = new URL(mongoUri);

export const migrationFileExtension = '.ts';
export const changelogCollectionName = 'migrations';
export const migrationsDir = 'src/migrations/';
export const mongodb = {
  url: mongoUri,
  databaseName: url.pathname.substring(1), // omit heading slash
  options: {
    useNewUrlParser: true, // removes a deprecation warning when connecting
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
