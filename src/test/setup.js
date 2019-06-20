
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

beforeAll(async(done) => {
  await mongoose.connect(mongoUri, { useNewUrlParser: true });
  await mongoose.connection.dropDatabase();
  done();
});

afterAll(async(done) => {
  await mongoose.disconnect();
  done();
});

module.exports = {};
