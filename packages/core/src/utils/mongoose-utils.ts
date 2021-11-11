import mongoose, {
  Model, Document, Schema,
} from 'mongoose';

export const initMongooseGlobalSettings = (): void => {
  // No More Deprecation Warning Options
  // see: https://mongoosejs.com/docs/migrating_to_6.html#the-aspromise-method-for-connections
};

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

export const getOrCreateModel = <Interface, Method>(modelName: string, schema: Schema<Interface>): Method & Model<Interface & Document> => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model<Interface & Document, Method & Model<Interface & Document>>(modelName);
  }
  return mongoose.model<Interface & Document, Method & Model<Interface & Document>>(modelName, schema);
};

// supress deprecation warnings
// see: https://mongoosejs.com/docs/deprecations.html
export const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
