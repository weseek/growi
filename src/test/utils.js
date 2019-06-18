
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';

const mongoose = require('mongoose');

const helpers = require('@commons/util/helpers');
const Crowi = require('@server/crowi');

const crowi = new Crowi(helpers.root(), process.env);

const models = {};

mongoose.Promise = global.Promise;

beforeAll(async() => {
  if (!mongoUri) {
    return;
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true });

  // drop database
  await mongoose.connection.dropDatabase();

  await crowi.initForTest();
});

afterAll(async() => {
  if (!mongoUri) {
    return;
  }

  return mongoose.disconnect();
});

module.exports = {
  models,
  mongoose,
};
