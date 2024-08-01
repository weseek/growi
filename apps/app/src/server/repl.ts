import type { REPLServer } from 'node:repl';
import repl from 'node:repl';

import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '~/server/util/mongoose-utils';


const setupMongoose = async(replServer: REPLServer) => {
  mongoose.Promise = global.Promise;

  await mongoose.connect(getMongoUri(), mongoOptions)
    .then(() => {
      replServer.context.db = mongoose.connection.db;
    });

  replServer.context.mongoose = mongoose;
};


const setupModels = async(replServer: REPLServer) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  const models = require('./models');

  Object.keys(models).forEach((modelName) => {
    global[modelName] = models[modelName];
  });
};

const start = async() => {
  const replServer = repl.start({
    prompt: `${process.env.NODE_ENV} > `,
    ignoreUndefined: true,
  });

  await setupMongoose(replServer);
  await setupModels(replServer);
};

start();
