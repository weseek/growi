/** **********************************************************
 *                           Caution
 *
 * Module aliases by compilerOptions.paths in tsconfig.json
 * are NOT available in setup scripts
 *********************************************************** */

const mongoose = require('mongoose');

const { initMongooseGlobalSettings, getMongoUri, mongoOptions } = require('@growi/core');

mongoose.Promise = global.Promise;

jest.setTimeout(30000); // default 5000

beforeAll(async() => {
  initMongooseGlobalSettings();
  process.env.MONGO_URI = 'mongodb://mongo/growi_v5_test';
  await mongoose.connect(getMongoUri(), mongoOptions);
});

afterAll(async() => {
  await mongoose.disconnect();
});

module.exports = {};
