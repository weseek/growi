// check env
if (process.env.NODE_ENV !== 'test') {
  throw new Error('\'process.env.NODE_ENV\' must be \'test\'');
}

const mongoose = require('mongoose');

const { getMongoUri } = require('../lib/util/mongoose-utils');

module.exports = async() => {
  await mongoose.connect(getMongoUri(), { useNewUrlParser: true });
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};
