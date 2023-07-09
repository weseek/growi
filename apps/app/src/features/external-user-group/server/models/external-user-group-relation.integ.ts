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
  const userId1 = new mongoose.Types.ObjectId();
  const groupId1 = new mongoose.Types.ObjectId();
  const groupId2 = new mongoose.Types.ObjectId();

  describe('createRelations', () => {
    let user1;

    beforeAll(async() => {
      user1 = await User.create({
        _id: userId1, name: 'user1', username: 'user1', email: 'user1@example.com',
      });
      await ExternalUserGroup.insertMany(
        {
          _id: groupId1, name: 'test group 1', externalId: 'testExternalId', provider: 'testProvider',
        },
        {
          _id: groupId2, name: 'test group 2', externalId: 'testExternalId', provider: 'testProvider',
        },
      );
    });

    it('creates relation for user', async() => {
      await ExternalUserGroupRelation.createRelations([groupId1, groupId2], user1);
      const relations = await ExternalUserGroupRelation.find();
      const idCombinations = relations.map((relation) => {
        return [relation.relatedGroup, relation.relatedUser];
      });
      expect(idCombinations).toStrictEqual([[groupId1, userId1], [groupId2, userId1]]);
    });
  });
});
