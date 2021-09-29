import mongoose from 'mongoose';
import { Collection } from 'mongodb';
import { getMongoUri, mongoOptions } from '@growi/core';

const migrate = require('../../../migrations/20210913153942-migrate-slack-app-integration-schema');

describe('migrate-slack-app-integration-schema', () => {

  let collection: Collection;

  beforeAll(async() => {
    await mongoose.connect(getMongoUri(), mongoOptions);
    collection = mongoose.connection.db.collection('slackappintegrations');

    await collection.insertMany([
      {
        tokenGtoP: 'tokenGtoP1', tokenPtoG: 'tokenPtoG1', supportedCommandsForBroadcastUse: ['foo'], supportedCommandsForSingleUse: ['bar'],
      },
      {
        tokenGtoP: 'tokenGtoP2', tokenPtoG: 'tokenPtoG2', permissionsForBroadcastUseCommands: { foo: true }, permissionsForSingleUseCommands: { bar: true },
      },
    ]);
  });

  test('up is applied successfully', async() => {
    // setup
    const doc1 = await collection.findOne({ tokenGtoP: 'tokenGtoP1' });
    const doc2 = await collection.findOne({ tokenGtoP: 'tokenGtoP2' });
    expect(doc1 != null).toBeTruthy();
    expect(doc2 != null).toBeTruthy();
    expect(doc1).toStrictEqual({
      _id: doc1._id,
      tokenGtoP: 'tokenGtoP1',
      tokenPtoG: 'tokenPtoG1',
      supportedCommandsForBroadcastUse: [
        'foo',
      ],
      supportedCommandsForSingleUse: [
        'bar',
      ],
    });
    expect(doc2).toStrictEqual({
      _id: doc2._id,
      tokenGtoP: 'tokenGtoP2',
      tokenPtoG: 'tokenPtoG2',
      permissionsForBroadcastUseCommands: {
        foo: true,
      },
      permissionsForSingleUseCommands: {
        bar: true,
      },
    });

    // when
    await migrate.up(mongoose.connection.db);

    // then
    const fixedDoc1 = await collection.findOne({ tokenGtoP: 'tokenGtoP1' });
    const fixedDoc2 = await collection.findOne({ tokenGtoP: 'tokenGtoP2' });
    expect(fixedDoc1 != null).toBeTruthy();
    expect(fixedDoc2 != null).toBeTruthy();
    expect(fixedDoc1.supportedCommandsForBroadcastUse).toBeUndefined();
    expect(fixedDoc1.supportedCommandsForSingleUse).toBeUndefined();
    expect(fixedDoc2.supportedCommandsForBroadcastUse).toBeUndefined();
    expect(fixedDoc2.supportedCommandsForSingleUse).toBeUndefined();
    expect(fixedDoc1).toStrictEqual({
      _id: doc1._id,
      tokenGtoP: 'tokenGtoP1',
      tokenPtoG: 'tokenPtoG1',
      permissionsForBroadcastUseCommands: {
        foo: true,
        search: false,
      },
      permissionsForSingleUseCommands: {
        bar: true,
        create: false,
        togetter: false,
      },
    });
    expect(fixedDoc2).toStrictEqual({
      _id: doc2._id,
      tokenGtoP: 'tokenGtoP2',
      tokenPtoG: 'tokenPtoG2',
      permissionsForBroadcastUseCommands: {
        foo: true,
        search: true,
      },
      permissionsForSingleUseCommands: {
        bar: true,
        create: true,
        togetter: true,
      },
    });
  });

});
