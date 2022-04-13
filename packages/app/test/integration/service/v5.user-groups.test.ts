
import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('UserGroupService', () => {
  // let dummyUser1;
  // let dummyUser2;

  let crowi;
  let UserGroup;


  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    UserGroup = mongoose.model('UserGroup');

    /*
     * Common
     */

    // dummyUser1 = await UserGroup.findOne({ username: 'v5DummyUser1' });
    // dummyUser2 = await UserGroup.findOne({ username: 'v5DummyUser2' });

    // xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);


    const groupId1 = new mongoose.Types.ObjectId();
    const groupId2 = new mongoose.Types.ObjectId();
    const groupId3 = new mongoose.Types.ObjectId();


    // Create Groups
    await UserGroup.insertMany([
      // no parent
      {
        _id: groupId1,
        name: 'v5_group1',
        description: 'description1',
      },
      // no parent
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
  test('Can update user group basic info', async() => {
    const userGroup = await UserGroup.findOne({ name: 'v5_group1' });
    await crowi.serGroupService.updateGroup(userGroup.id, 'v5_group1_new', 'description1_new');

    expect(userGroup.name).toBe('v5_group1_new');
    expect(userGroup.description).toBe('description1_new');
  });

});
