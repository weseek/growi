import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { mongoOptions } from '../../src/server/util/mongoose-utils';


beforeAll(async() => {
  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'growi_test' },
  });
  await mongoose.connect(mongoServer.getUri(), mongoOptions);
});

afterAll(async() => {
  await mongoose.disconnect();
});
