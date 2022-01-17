import mongoose from 'mongoose';
import { pagePathUtils } from '@growi/core';

import UserGroup from '~/server/models/user-group';
import { PageModel } from '~/server/models/page';
import { PageQueryBuilder } from '../models/obsolete-page';
import { excludeTestIdsFromTargetIds, removeDuplicates } from '~/server/util/compare-objectId';

const { isTopPage } = pagePathUtils;

type ObjectId = mongoose.Types.ObjectId;

class PageGrantService {

  crowi!: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  private validateGrantValues(grant, grantedGroupId) {
    const Page = mongoose.model('Page') as PageModel;

    if (grant === Page.GRANT_USER_GROUP && grantedGroupId == null) {
      throw Error('grantedGroupId is not specified');
    }
  }

  validateByGrantUsers(targetUsers: ObjectId[], ancestorsUsers: ObjectId[], descendantsUsers?: ObjectId[]): boolean {
    const usersShouldNotExist1 = excludeTestIdsFromTargetIds(targetUsers, ancestorsUsers);
    if (usersShouldNotExist1.length > 0) {
      return false;
    }

    if (descendantsUsers == null) {
      return true;
    }

    const usersShouldNotExist2 = excludeTestIdsFromTargetIds(descendantsUsers, targetUsers);
    if (usersShouldNotExist2.length > 0) {
      return false;
    }

    return true;
  }

  private async generateTargetsGrantedUsersForCreate(user, grant, grantedUserIds: ObjectId[], grantedGroupId: ObjectId): Promise<ObjectId[]> {
    // validate values
    this.validateGrantValues(grant, grantedGroupId);

    let targetGrantedUsers: ObjectId[] = [];

    const Page = mongoose.model('Page') as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    if (grant === Page.GRANT_USER_GROUP) {
      const targetGroup = await UserGroup.findOne({ _id: grantedGroupId });
      if (targetGroup == null) {
        throw Error('The group of grantedGroupId does not exist.');
      }

      const targetRelations = await UserGroupRelation.find({ relatedGroup: grantedGroupId }, { _id: 0, relatedUser: 1 });
      targetGrantedUsers = targetRelations.map(r => r.relatedUser) as ObjectId[];
    }
    if (grant === Page.GRANT_OWNER) {
      targetGrantedUsers = [user._id];
    }

    return targetGrantedUsers;
  }

  /**
   * It finds the nearest ancestor page from the targetPath. Then returns an array of grantedUsers of the ancestor page.
   * @param targetPath string of the target path
   * @returns Promise<ObjectId[]>
   */
  private async generateAncestorsGrantedUsers(targetPath: string): Promise<ObjectId[]> {
    const Page = mongoose.model('Page') as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    let ancestorUsers: ObjectId[] = [];

    /*
     * make granted users list of ancestor's
     */
    const builderForAncestors = new PageQueryBuilder(Page.find(), false);
    const ancestors = await builderForAncestors
      .addConditionToListOnlyAncestors(targetPath)
      .addConditionToSortPagesByDescPath()
      .query
      .exec();
    const testAncestor = ancestors[0];
    if (testAncestor == null) {
      throw Error('testAncestor must exist');
    }
    // validate values
    this.validateGrantValues(testAncestor.grant, testAncestor.grantedGroup);

    if (testAncestor.grant === Page.GRANT_PUBLIC) {
      ancestorUsers = [];
    }
    else if (testAncestor.grant === Page.GRANT_USER_GROUP) {
      // make a set of all users
      const ancestorsGrantedRelations = await UserGroupRelation.find({ relatedGroup: testAncestor.grantedGroup }, { _id: 0, relatedUser: 1 });
      ancestorUsers = Array.from(new Set(ancestorsGrantedRelations.map(r => r.relatedUser))) as ObjectId[];
    }
    else if (testAncestor.grant === Page.GRANT_OWNER) {
      ancestorUsers = testAncestor.grantedUsers;
    }

    return ancestorUsers;
  }

  /**
   * It calculates and returns the set of the all grantedUsers of all descendant pages of the targetPath.
   * @param targetPath string of the target path
   * @returns Promise<ObjectId[]>
   */
  private async generateDescendantsGrantedUsers(targetPath: string): Promise<ObjectId[]> {
    const Page = mongoose.model('Page') as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    /*
     * make granted users list of descendant's
     */
    // find all descendants excluding empty pages
    const builderForDescendants = new PageQueryBuilder(Page.find({}, { _id: 0, grantedUsers: 1, grantedGroup: 1 }), false);
    const descendants = await builderForDescendants
      .addConditionToListOnlyDescendants(targetPath)
      .query
      .exec();

    let grantedUsersOfGrantOwner: ObjectId[] = []; // users of GRANT_OWNER
    const grantedUsersOfGrantUserGroup: ObjectId[] = []; // users of GRANT_GROUP
    const grantedGroups: ObjectId[] = [];
    descendants.forEach((d) => {
      if (d.grantedUsers != null) {
        grantedUsersOfGrantOwner = grantedUsersOfGrantOwner.concat(d.grantedUsers);
      }
      if (d.grantedGroup != null) {
        grantedGroups.push(d.grantedGroup);
      }
    });

    const uniqueGrantedGroups = removeDuplicates(grantedGroups);
    const grantedRelations = await UserGroupRelation.find({ relatedGroup: { $in: uniqueGrantedGroups } }, { _id: 0, relatedUser: 1 });
    grantedRelations.forEach(r => grantedUsersOfGrantUserGroup.push(r.relatedUser));
    return removeDuplicates([...grantedUsersOfGrantOwner, ...grantedUsersOfGrantUserGroup]);
  }

  async pageValidationForCreate(pathToCreate: string, user, grant, grantedUserIds: ObjectId[], grantedGroupId: ObjectId): Promise<boolean> {
    if (isTopPage(pathToCreate)) {
      return true;
    }

    const targetUsers = await this.generateTargetsGrantedUsersForCreate(user, grant, grantedUserIds, grantedGroupId);
    const ancestorUsers = await this.generateAncestorsGrantedUsers(pathToCreate);

    // find existing empty page at target path
    // it will be unnecessary to check the descendant if emptyTarget is null
    const Page = mongoose.model('Page') as PageModel;
    const emptyTarget = await Page.findOne({ path: pathToCreate });
    if (emptyTarget == null) { // checking the parent is enough
      return this.validateByGrantUsers(targetUsers, ancestorUsers);
    }

    const descendantUsers = await this.generateDescendantsGrantedUsers(pathToCreate);

    return this.validateByGrantUsers(targetUsers, ancestorUsers, descendantUsers);
  }

}

export default PageGrantService;
