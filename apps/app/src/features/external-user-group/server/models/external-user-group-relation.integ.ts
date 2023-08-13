import mongoose from 'mongoose';

import ExternalUserGroup from './external-user-group';
import ExternalUserGroupRelation from './external-user-group-relation';

// TODO: use actual user model after ~/server/models/user.js becomes importable in vitest
// ref: https://github.com/vitest-dev/vitest/issues/846
const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});
const User = mongoose.model('User', userSchema);

describe('ExternalUserGroupRelation model', () => {
  let user1;
  let user2;

  beforeAll(async() => {
    user1 = await User.create({
      name: 'user1', username: 'user1', email: 'user1@example.com',
    });

    user2 = await User.create({
      name: 'user2', username: 'user2', email: 'user2@example.com',
    });
  });

  afterEach(async() => {
    await ExternalUserGroup.deleteMany();
    await ExternalUserGroupRelation.deleteMany();
  });

  describe('createRelations', () => {
    const groupId1 = new mongoose.Types.ObjectId();
    const groupId2 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await ExternalUserGroup.insertMany([
        {
          _id: groupId1, name: 'test group 1', externalId: 'testExternalId', provider: 'testProvider',
        },
        {
          _id: groupId2, name: 'test group 2', externalId: 'testExternalId2', provider: 'testProvider',
        },
      ]);
    });

    it('creates relation for user', async() => {
      await ExternalUserGroupRelation.createRelations([groupId1, groupId2], user1);
      const relations = await ExternalUserGroupRelation.find();
      const idCombinations = relations.map((relation) => {
        return [relation.relatedGroup, relation.relatedUser];
      });
      expect(idCombinations).toStrictEqual([[groupId1, user1._id.toString()], [groupId2, user1._id.toString()]]);
    });
  });

  describe('removeAllInvalidRelations', () => {
    const groupId1 = new mongoose.Types.ObjectId();
    const groupId2 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await ExternalUserGroupRelation.createRelations([groupId1, groupId2], user1);
    });

    it('removes invalid relations', async() => {
      const relationsBeforeRemoval = await ExternalUserGroupRelation.find();
      expect(relationsBeforeRemoval.length).not.toBe(0);

      await ExternalUserGroupRelation.removeAllInvalidRelations();

      const relationsAfterRemoval = await ExternalUserGroupRelation.find();
      expect(relationsAfterRemoval.length).toBe(0);
    });
  });

  describe('findAllUserIdsForUserGroups', () => {
    const groupId1 = new mongoose.Types.ObjectId();
    const groupId2 = new mongoose.Types.ObjectId();
    const groupId3 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await ExternalUserGroupRelation.createRelations([groupId1, groupId2], user1);
      await ExternalUserGroupRelation.create({ relatedGroup: groupId3, relatedUser: user2._id });
    });

    it('finds all unique user ids for specified user groups', async() => {
      const userIds = await ExternalUserGroupRelation.findAllUserIdsForUserGroups([groupId1, groupId2, groupId3]);
      expect(userIds).toStrictEqual([user1._id.toString(), user2._id.toString()]);
    });
  });

  describe('findAllUserGroupIdsRelatedToUser', () => {
    const groupId1 = new mongoose.Types.ObjectId();
    const groupId2 = new mongoose.Types.ObjectId();
    const groupId3 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await ExternalUserGroupRelation.createRelations([groupId1, groupId2], user1);
      await ExternalUserGroupRelation.create({ relatedGroup: groupId3, relatedUser: user2._id });
    });

    it('finds all group ids related to user', async() => {
      const groupIds = await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user1);
      expect(groupIds).toStrictEqual([groupId1.toString(), groupId2._id.toString()]);

      const groupIds2 = await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user2);
      expect(groupIds2).toStrictEqual([groupId3.toString()]);
    });
  });
});
