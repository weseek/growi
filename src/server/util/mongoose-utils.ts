import mongoose, { Model, Document, ConnectionOptions } from 'mongoose';

export const getMongoUri = (): string => {
  const { env } = process;

  return env.MONGOLAB_URI // for B.C.
    || env.MONGODB_URI // MONGOLAB changes their env name
    || env.MONGOHQ_URL
    || env.MONGO_URI
    || ((env.NODE_ENV === 'test') ? 'mongodb://mongo/growi_test' : 'mongodb://mongo/growi');
};

export const getModelSafely = <T extends Document>(modelName: string): Model<T> | null => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model<T>(modelName);
  }
  return null;
};

export const mongoOptions: ConnectionOptions = {
  useNewUrlParser: true, // removes a deprecation warning when connecting
  useUnifiedTopology: true,
  useFindAndModify: false,
};

module.exports = {
  getMongoUri,
  getModelSafely,
  mongoOptions,
};
