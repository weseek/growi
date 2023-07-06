import mongoose from 'mongoose';
import type {
  Model, Document, ConnectOptions, Schema,
} from 'mongoose';

// suppress DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version
type ConnectionOptionsExtend = {
  useUnifiedTopology: boolean
}

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

export const getOrCreateModel = <Interface, Method>(modelName: string, schema: Schema<Interface & Document>): Method & Model<Interface & Document> => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model<Interface & Document, Method & Model<Interface & Document>>(modelName);
  }
  return mongoose.model<Interface & Document, Method & Model<Interface & Document>>(modelName, schema);
};

// supress deprecation warnings
// useNewUrlParser no longer necessary
// see: https://mongoosejs.com/docs/migrating_to_6.html#no-more-deprecation-warning-options
export const mongoOptions: ConnectOptions & ConnectionOptionsExtend = {
  useUnifiedTopology: true,
};
