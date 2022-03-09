/** **********************************************************
 *                           Caution
 *
 * Module aliases by compilerOptions.paths in tsconfig.json
 * are NOT available in setup scripts
 *********************************************************** */

import 'tsconfig-paths/register';

import mongoose from 'mongoose';

import { initMongooseGlobalSettings, getMongoUri, mongoOptions } from '@growi/core';

// check env
if (process.env.NODE_ENV !== 'test') {
  throw new Error('\'process.env.NODE_ENV\' must be \'test\'');
}

module.exports = async() => {
  initMongooseGlobalSettings();

  mongoose.connect(getMongoUri(), mongoOptions);

  // drop database
  await mongoose.connection.dropDatabase();

  // init DB
  const pageCollection = mongoose.connection.collection('pages');
  const userCollection = mongoose.connection.collection('users');
  const userGroupCollection = mongoose.connection.collection('userGroups');
  const userGroupRelationCollection = mongoose.connection.collection('userGroupRelations');

  // create global user & rootPage
  const globalUser = (await userCollection.insertMany([{ name: 'globalUser', username: 'globalUser', email: 'globalUser@example.com' }]))[0];
  await userCollection.insertMany([
    { name: 'v5DummyUser1', username: 'v5DummyUser1', email: 'v5DummyUser1@example.com' },
    { name: 'v5DummyUser2', username: 'v5DummyUser2', email: 'v5DummyUser2@example.com' },
  ]);

  await userGroupCollection.insertMany([{ name: 'DummyGroup1' }]);
  const dummyUserGroup1 = await userCollection.findOne({ username: 'v5DummyUser1' });
  await userGroupCollection.insertMany([{ name: 'DummyChildGroup2', parent: dummyUserGroup1 }]);
  const dummyChildUserGroup2 = await userGroupCollection.findOne({ name: 'DummyChildGroup2' });

  const dummyUser1 = await userCollection.findOne({ username: 'v5DummyUser1' });
  const dummyUser2 = await userCollection.findOne({ username: 'v5DummyUser2' });

  await userGroupRelationCollection.insertMany([
    {
      relatedGroup: dummyUserGroup1,
      relatedUser: dummyUser1,
    },
    {
      relatedGroup: dummyUserGroup1,
      relatedUser: dummyUser2,
    },
    {
      relatedGroup: dummyChildUserGroup2,
      relatedUser: dummyUser1,
    },
  ]);

  await pageCollection.insertMany([{
    path: '/',
    grant: 1,
    creator: globalUser,
    lastUpdateUser: globalUser,
  }]);

  await mongoose.disconnect();
};
