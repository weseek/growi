const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';

const mongoose = require('mongoose');

module.exports = async() => {
  await mongoose.connect(mongoUri, { useNewUrlParser: true });
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};
