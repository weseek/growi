
import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('UserGroupService', () => {
  let crowi;
  let UserGroup;

  const groupId1 = new mongoose.Types.ObjectId();
  const groupId2 = new mongoose.Types.ObjectId();
  const groupId3 = new mongoose.Types.ObjectId();


  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    UserGroup = mongoose.model('UserGroup');


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
      {
        _id: groupId3,
        name: 'v5_group3',
        parent: groupId1,
        description: 'description3',
      },
    ]);
  });

  /*
    * Update UserGroup
    */
  test('Can update user group basic info (name, description, parent)', async() => {
    const userGroup = await UserGroup.findOne({ _id: groupId1 });

    const newGroupName = 'v5_group1_new';
    const newGroupDescription = 'description1_new';
    const newParentId = groupId2;

    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup._id, newGroupName, newGroupDescription, newParentId);

    expect(updatedUserGroup.name).toBe(newGroupName);
    expect(updatedUserGroup.description).toBe(newGroupDescription);
    expect(updatedUserGroup.parent).toStrictEqual(newParentId);
  });

  test('Should throw an error when trying to set existing group name', async() => {
    const userGroup = await UserGroup.findOne({ _id: groupId1 });
    await expect(crowi.userGroupService.updateGroup(userGroup._id, 'v5_group2')).rejects.toThrow('The group name is already taken');
  });

  test('Parent will be null If parent group is released', async() => {
    const userGroup = await UserGroup.findOne({ _id: groupId3 });
    const updatedUserGroup = await crowi.userGroupService.updateGroup(userGroup._id, userGroup.name, userGroup.description, null);

    expect(updatedUserGroup.parent).toBeNull();
  });

});
