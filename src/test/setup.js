const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

jest.setTimeout(30000); // default 5000

beforeAll(async(done) => {
  await mongoose.connect(mongoUri, { useNewUrlParser: true });
  done();
});

afterAll(async(done) => {
  await mongoose.disconnect();
  done();
});

module.exports = {};
