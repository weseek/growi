import mongoose from 'mongoose';
import { pagePathUtils } from '@growi/core';

import UserGroup from '~/server/models/user-group';
import { PageModel } from '~/server/models/page';
import { PageQueryBuilder } from '../models/obsolete-page';
import { excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';

const { isTopPage } = pagePathUtils;

type ObjectId = mongoose.Types.ObjectId;

class PageGrantService {

  crowi!: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  private validateGrantValues(grant, grantedUserId: ObjectId, grantedGroupId: ObjectId) {
    const Page = mongoose.model('Page') as PageModel;

    if (grant === Page.GRANT_USER_GROUP && grantedGroupId == null) {
      throw Error('grantedGroupId is not specified');
    }
    if (grant === Page.GRANT_OWNER && grantedUserId == null) {
      throw Error('grantedUserId is not specified');
    }
    if (grant === Page.GRANT_SPECIFIED && grantedUserId == null) {
      throw Error('grantedUserId is not specified');
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

  async generateTargetsGrantedUsers(grant, grantedUserId: ObjectId, grantedGroupId: ObjectId): Promise<ObjectId[]> {
    // validate values
    this.validateGrantValues(grant, grantedUserId, grantedGroupId);

    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    const targetGroup = await UserGroup.findOne({ _id: grantedGroupId });
    if (targetGroup == null) {
      throw Error('The group of grantedGroupId does not exist.');
    }

    const targetRelations = await UserGroupRelation.find({ relatedGroup: grantedGroupId }, { _id: 0, relatedUser: 1 });
    return targetRelations.map(r => r.relatedUser) as ObjectId[];
  }

  async generateAncestorsGrantedUsers(pathToCreate: string): Promise<ObjectId[]> {
    const Page = mongoose.model('Page') as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    let ancestorUsers: ObjectId[] | null = null;

    /*
     * make granted users list of ancestor's
     */
    const builderForAncestors = new PageQueryBuilder(Page.find({}, { _id: 0, grantedGroup: 1 }), false);
    const ancestors = await builderForAncestors
      .addConditionToListOnlyAncestors(pathToCreate)
      .addConditionToSortPagesByDescPath()
      .query
      .exec();
    const testAncestor = ancestors[0];
    if (testAncestor == null) {
      throw Error('testAncestor must exist');
    }
    // validate values
    this.validateGrantValues(testAncestor.grant, testAncestor.grantedUsers, testAncestor.grantedGroup);

    if (testAncestor.grant === Page.GRANT_PUBLIC) {
      ancestorUsers = [];
    }
    else if (testAncestor.grant === Page.GRANT_USER_GROUP) {
      // make a set of all users
      const ancestorsGrantedRelations = await UserGroupRelation.find({ relatedGroup: testAncestor.grantedGroup }, { _id: 0, relatedUser: 1 });
      ancestorUsers = Array.from(new Set(ancestorsGrantedRelations.map(r => r.relatedUser))) as ObjectId[];
    }
    else if (testAncestor.grant === Page.GRANT_SPECIFIED || testAncestor.grant === Page.GRANT_OWNER) {
      ancestorUsers = testAncestor.grantedUsers;
    }

    if (ancestorUsers == null || Array.isArray(ancestorUsers)) {
      throw Error('ancestorUsers is unexpectedly non-array type value.');
    }

    return ancestorUsers;
  }

  async generateDescendantsGrantedUsers(pathToCreate: string): Promise<ObjectId[]> {
    const Page = mongoose.model('Page') as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    /*
     * make granted users list of descendant's
     */
    // find all descendants excluding empty pages
    const builderForDescendants = new PageQueryBuilder(Page.find({}, { _id: 0, grantedGroup: 1 }), false);
    const descendants = await builderForDescendants
      .addConditionToListOnlyDescendants(pathToCreate)
      .query
      .exec();
    // make a set of all users
    const descendantsGrantedGroups = Array.from(new Set(descendants.map(d => d.grantedGroup)));
    const descendantsGrantedRelations = await UserGroupRelation.find({ relatedGroup: { $in: descendantsGrantedGroups } }, { _id: 0, relatedUser: 1 });
    return Array.from(new Set(descendantsGrantedRelations.map(r => r.relatedUser)));
  }

  async pageCreateValidation(pathToCreate: string, grant, grantedUserId: ObjectId, grantedGroupId: ObjectId) {
    if (isTopPage(pathToCreate)) {
      return true;
    }

    const targetUsers = await this.generateTargetsGrantedUsers(grant, grantedUserId, grantedGroupId);
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
