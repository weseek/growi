/** **********************************************************
 *                           Caution
 *
 * Module aliases by compilerOptions.paths in tsconfig.json
 * are NOT available in setup scripts
 *********************************************************** */

const mongoose = require('mongoose');

const { initMongooseGlobalSettings, getMongoUriForTestV4, mongoOptions } = require('@growi/core');

mongoose.Promise = global.Promise;

jest.setTimeout(30000); // default 5000

beforeAll(async() => {
  initMongooseGlobalSettings();
  await mongoose.connect(getMongoUriForTestV4(), mongoOptions);
});

afterAll(async() => {
  await mongoose.disconnect();
});

module.exports = {};
