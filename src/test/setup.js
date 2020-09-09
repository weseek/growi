/** **********************************************************
 *                           Caution
 *
 * Module aliases by compilerOptions.paths in tsconfig.json
 * are NOT available in setup scripts
 *********************************************************** */

const mongoose = require('mongoose');

const { getMongoUri, mongoOptions } = require('~/server/util/mongoose-utils');

mongoose.Promise = global.Promise;

jest.setTimeout(30000); // default 5000

beforeAll(async(done) => {
  await mongoose.connect(getMongoUri(), mongoOptions);
  done();
});

afterAll(async(done) => {
  await mongoose.disconnect();
  done();
});

module.exports = {};
