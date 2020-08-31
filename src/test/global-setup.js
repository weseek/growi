/** **********************************************************
 *                           Caution
 *
 * Module aliases by compilerOptions.paths in tsconfig.json
 * are NOT available in setup scripts
 *********************************************************** */

import 'tsconfig-paths/register';

import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '~/utils/mongoose-utils';

// check env
if (process.env.NODE_ENV !== 'test') {
  throw new Error('\'process.env.NODE_ENV\' must be \'test\'');
}


// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { getInstance } = require('./setup-crowi');

module.exports = async() => {
  await mongoose.connect(getMongoUri(), mongoOptions);

  // drop database
  await mongoose.connection.dropDatabase();

  // init DB
  // const crowi = await getInstance();
  // const appService = crowi.appService;
  // await appService.initDB();

  await mongoose.disconnect();
};
