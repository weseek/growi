
import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('UserGroupService', () => {
  let crowi;
  let UserGroup;
  let UserGroupRelation;

  const groupId1 = new mongoose.Types.ObjectId();
  const groupId2 = new mongoose.Types.ObjectId();
  const groupId3 = new mongoose.Types.ObjectId();
  const groupId4 = new mongoose.Types.ObjectId();
  const groupId5 = new mongoose.Types.ObjectId();
  const groupId6 = new mongoose.Types.ObjectId();
  const groupId7 = new mongoose.Types.ObjectId();
  const groupId8 = new mongoose.Types.ObjectId();

  const userId1 = new mongoose.Types.ObjectId();

  beforeAll(async() => {
    crowi = await getInstance();
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');


    // Create Groups
    await UserGroup.insertMany([
      // No parent
      {
        _id: groupId1,
        name: 'v5_group1',
        description: 'description1',
      },
      // No parent
      {
        _id: groupId2,
        name: 'v5_group2',
        description: 'description2',
      },
      // No parent
      {
        _id: groupId3,
        name: 'v5_group3',
        description: 'description3',
      },
      // No parent
      {
        _id: groupId4,
        name: 'v5_group4',
        description: 'description4',
      },
      // No parent
      {
        _id: groupId5,
        name: 'v5_group5',
        description: 'description5',
      },
      // No parent
      {
        _id: groupId6,
        name: 'v5_group6',
        description: 'description5',
      },
      // No parent
      {
        _id: groupId7,
        name: 'v5_group7',
        description: 'description5',
      },
      // No parent
      {
        _id: groupId8,
        name: 'v5_group8',
        description: 'description5',
      },
    ]);

    // Create UserGroupRelations
    await UserGroupRelation.insertMany([
      {
        relatedGroup: groupId4,
        relatedUser: userId1,
      },
      {
        relatedGroup: groupId6,
        relatedUser: userId1,
      },
      {
        relatedGroup: groupId8,
        relatedUser: userId1,
      },
    ]);

  });

  /*
    * Update UserGroup
    */
  test('Updated values should be reflected. (name, description, parent)', async() => {
    const userGroup1 = await UserGroup.findOne({ _id: groupId1 });
    const userGroup2 = await UserGroup.findOne({ _id: groupId2 });

    const newGroupName = 'v5_group1_new';
    const newGroupDescription = 'description1_new';
    const newParentId = userGroup2._id;

    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup1._id, newGroupName, newGroupDescription, newParentId);

    expect(updatedUserGroup.name).toBe(newGroupName);
    expect(updatedUserGroup.description).toBe(newGroupDescription);
    expect(updatedUserGroup.parent).toStrictEqual(newParentId);
  });

  test('Should throw an error when trying to set existing group name', async() => {
    const userGroup1 = await UserGroup.findOne({ _id: groupId1 });
    const userGroup2 = await UserGroup.findOne({ _id: groupId2 });

    const result = crowi.userGroupService.updateGroup(userGroup1._id, userGroup2.name);

    await expect(result).rejects.toThrow('The group name is already taken');
  });

  test('Parent should be null when parent group is released', async() => {
    const userGroup = await UserGroup.findOne({ _id: groupId3 });
    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup._id, userGroup.name, userGroup.description, null);

    expect(updatedUserGroup.parent).toBeNull();
  });

  // In case that forceUpdateParents is false
  test('Should throw an error when users in child group do not exist in parent group', async() => {
    const userGroup4 = await UserGroup.findOne({ _id: groupId4 });
    const userGroup5 = await UserGroup.findOne({ _id: groupId5 });

    const result = crowi.userGroupService.updateGroup(userGroup4._id, userGroup4.name, userGroup4.description, userGroup5._id);

    await expect(result).rejects.toThrow('The parent group does not contain the users in this group.');
  });

  /*
  * forceUpdateParents true
  */
  test('User should be included to parent group (2 groups ver)', async() => {
    const userGroup4 = await UserGroup.findOne({ _id: groupId4 });
    const userGroup4Relation = await UserGroupRelation.findOne({ relatedGroup:  userGroup4, relatedUser: userId1 });
    const userGroup5 = await UserGroup.findOne({ _id: groupId5 });

    const forceUpdateParents = true;

    const updatedUserGroup = await crowi.userGroupService.updateGroup(
      userGroup4._id, userGroup4.name, userGroup4.description, userGroup5._id, forceUpdateParents,
    );
    const relatedGroup = await UserGroupRelation.findOne({ relatedGroup: userGroup5._id, relatedUser: userGroup4Relation.relatedUser });

    expect(updatedUserGroup.parent).toStrictEqual(userGroup5._id);
    expect(relatedGroup).toBeTruthy();
  });

  test('User should be included to parent group (3 groups ver)', async() => {
    const userGroup8 = await UserGroup.findOne({ _id: groupId8 });
    const forceUpdateParents = true;

    await crowi.userGroupService.updateGroup(
      userGroup8._id, userGroup8.name, userGroup8.description, groupId7, forceUpdateParents,
    );
    const relatedGroup6 = await UserGroupRelation.findOne({ relatedGroup: groupId6, relatedUser: userId1 });
    const relatedGroup7 = await UserGroupRelation.findOne({ relatedGroup: groupId7, relatedUser: userId1 });
    const relatedGroup8 = await UserGroupRelation.findOne({ relatedGroup: groupId8, relatedUser: userId1 });

    expect(relatedGroup6).toBeTruthy();
    expect(relatedGroup7).toBeTruthy();
    expect(relatedGroup8).toBeTruthy();
  });

});
