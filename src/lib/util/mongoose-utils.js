const mongoose = require('mongoose');

const getMongoUri = () => {
  const { env } = process;

  return env.MONGOLAB_URI // for B.C.
    || env.MONGODB_URI // MONGOLAB changes their env name
    || env.MONGOHQ_URL
    || env.MONGO_URI
    || ((env.NODE_ENV === 'test') ? 'mongodb://mongo/growi_test' : 'mongodb://mongo/growi');
};

const getModelSafely = (modelName) => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model(modelName);
  }
  return null;
};

const mongoOptions = {
  useNewUrlParser: true, // removes a deprecation warning when connecting
  useUnifiedTopology: true,
  useFindAndModify: false,
};

module.exports = {
  getMongoUri,
  getModelSafely,
  mongoOptions,
};
