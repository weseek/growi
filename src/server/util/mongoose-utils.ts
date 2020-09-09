import mongoose, {
  Model, Document, ConnectionOptions, Schema,
} from 'mongoose';

export const getMongoUri = (): string => {
  const { env } = process;

  return env.MONGOLAB_URI // for B.C.
    || env.MONGODB_URI // MONGOLAB changes their env name
    || env.MONGOHQ_URL
    || env.MONGO_URI
    || ((env.NODE_ENV === 'test') ? 'mongodb://mongo/growi_test' : 'mongodb://mongo/growi');
};

export const getModelSafely = <T>(modelName: string): Model<T & Document> | null => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model<T & Document>(modelName);
  }
  return null;
};

export const getOrCreateModel = <T>(modelName: string, schema: Schema<T>): Model<T & Document> => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model<T & Document>(modelName);
  }
  return mongoose.model<T & Document>(modelName, schema);
};

export const mongoOptions: ConnectionOptions = {
  useNewUrlParser: true, // removes a deprecation warning when connecting
  useUnifiedTopology: true,
  useFindAndModify: false,
};
