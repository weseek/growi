
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';

const mongoose = require('mongoose');

const models = require('@server/models');
models.Config = require('@server/models/config');

const helpers = require('@commons/util/helpers');
const crowi = new (require('@server/crowi'))(helpers.root());

mongoose.Promise = global.Promise;

beforeAll(async() => {
  if (!mongoUri) {
    return;
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true });
  await mongoose.connection.dropDatabase();
});

afterAll(async() => {
  if (!mongoUri) {
    return;
  }

  return mongoose.disconnect();
});

// Setup Models
// for (const [modelName, model] of Object.entries(models)) {
//   models[modelName] = model(crowi);
// }
// crowi.models = models;

module.exports = {
  models,
  mongoose,
};
