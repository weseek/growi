require('module-alias/register');

// check env
if (process.env.NODE_ENV !== 'test') {
  throw new Error('\'process.env.NODE_ENV\' must be \'test\'');
}

const mongoose = require('mongoose');

const { getMongoUri } = require('../lib/util/mongoose-utils');

const { getInstance } = require('./setup-crowi');

module.exports = async() => {
  await mongoose.connect(getMongoUri(), { useNewUrlParser: true });

  // drop database
  await mongoose.connection.dropDatabase();

  // init DB
  const crowi = await getInstance();
  const appService = crowi.appService;
  await appService.initDB();

  await mongoose.disconnect();
};
