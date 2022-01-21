import mongoose from 'mongoose';
import { pagePathUtils, pathUtils } from '@growi/core';
import escapeStringRegexp from 'escape-string-regexp';

import UserGroup from '~/server/models/user-group';
import { PageModel } from '~/server/models/page';
import { PageQueryBuilder } from '../models/obsolete-page';
import { isIncludesObjectId, removeDuplicates, excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';

const { addTrailingSlash } = pathUtils;
const { isTopPage } = pagePathUtils;

type ObjectId = mongoose.Types.ObjectId;

type ComparableTarget = {
  grant: number,
  grantedUserIds?: ObjectId[],
  grantedGroupId: ObjectId,
  applicableUserIds?: ObjectId[],
  applicableGroupIds?: ObjectId[],
};

type ComparableAncestor = {
  grant: number,
  grantedUserIds: ObjectId[],
  applicableUserIds?: ObjectId[],
  applicableGroupIds?: ObjectId[],
};

type ComparableDescendants = {
  isPublicExist: boolean,
  grantedUserIds: ObjectId[],
  grantedGroupIds: ObjectId[],
};

class PageGrantService {

  crowi!: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  private validateComparableTarget(comparable: ComparableTarget) {
    const Page = mongoose.model('Page') as unknown as PageModel;

    const { grant, grantedUserIds, grantedGroupId } = comparable;

    if (grant === Page.GRANT_OWNER && (grantedUserIds == null || grantedUserIds.length !== 1)) {
      throw Error('grantedUserIds must not be null and must have 1 length');
    }
    if (grant === Page.GRANT_USER_GROUP && grantedGroupId == null) {
      throw Error('grantedGroupId is not specified');
    }
  }

  /**
   * About the rule of validation, see: https://dev.growi.org/61b2cdabaa330ce7d8152844
   * @returns boolean
   */
  private processValidation(target: ComparableTarget, ancestor: ComparableAncestor, descendants?: ComparableDescendants): boolean {
    this.validateComparableTarget(target);

    const Page = mongoose.model('Page') as unknown as PageModel;

    /*
     * ancestor side
     */
    // GRANT_PUBLIC
    if (ancestor.grant === Page.GRANT_PUBLIC) { // any page can exist under public page
      // do nothing
    }
    // GRANT_OWNER
    else if (ancestor.grant === Page.GRANT_OWNER) {
      if (target.grantedUserIds?.length !== 1) {
        throw Error('grantedUserIds must have one user');
      }

      if (target.grant !== Page.GRANT_OWNER) { // only GRANT_OWNER page can exist under GRANT_OWNER page
        return false;
      }

      if (!ancestor.grantedUserIds[0].equals(target.grantedUserIds[0])) { // the grantedUser must be the same as parent's under the GRANT_OWNER page
        return false;
      }
    }
    // GRANT_USER_GROUP
    else if (ancestor.grant === Page.GRANT_USER_GROUP) {
      if (ancestor.applicableGroupIds == null || ancestor.applicableUserIds == null) {
        throw Error('applicableGroupIds and applicableUserIds are not specified');
      }

      if (target.grant === Page.GRANT_PUBLIC) { // public page must not exist under GRANT_USER_GROUP page
        return false;
      }

      if (target.grant === Page.GRANT_OWNER) {
        if (target.grantedUserIds?.length !== 1) {
          throw Error('grantedUserIds must have one user');
        }

        if (!isIncludesObjectId(ancestor.applicableUserIds, target.grantedUserIds[0])) { // GRANT_OWNER pages under GRAND_USER_GROUP page must be owned by the member of the grantedGroup of the GRAND_USER_GROUP page
          return false;
        }
      }

      if (target.grant === Page.GRANT_USER_GROUP) {
        if (!isIncludesObjectId(ancestor.applicableGroupIds, target.grantedGroupId)) { // only child groups or the same group can exist under GRANT_USER_GROUP page
          return false;
        }
      }
    }

    if (descendants == null) {
      return true;
    }
    /*
     * descendant side
     */

    // GRANT_PUBLIC
    if (target.grant === Page.GRANT_PUBLIC) { // any page can exist under public page
      // do nothing
    }
    // GRANT_OWNER
    else if (target.grant === Page.GRANT_OWNER) {
      if (target.grantedUserIds?.length !== 1) {
        throw Error('grantedUserIds must have one user');
      }

      if (descendants.isPublicExist) { // public page must not exist under GRANT_OWNER page
        return false;
      }

      if (descendants.grantedGroupIds.length !== 0 || descendants.grantedUserIds.length > 1) { // groups or more than 2 grantedUsers must not be in descendants
        return false;
      }

      if (descendants.grantedUserIds.length === 1 && !descendants.grantedUserIds[0].equals(target.grantedUserIds[0])) { // if Only me page exists, then all of them must be owned by the same user as the target page
        return false;
      }
    }
    // GRANT_USER_GROUP
    else if (target.grant === Page.GRANT_USER_GROUP) {
      if (target.applicableGroupIds == null || target.applicableUserIds == null) {
        throw Error('applicableGroupIds and applicableUserIds must not be null');
      }

      if (descendants.isPublicExist) { // public page must not exist under GRANT_USER_GROUP page
        return false;
      }

      const shouldNotExistGroupIds = excludeTestIdsFromTargetIds(descendants.grantedGroupIds, target.applicableGroupIds);
      const shouldNotExistUserIds = excludeTestIdsFromTargetIds(descendants.grantedUserIds, target.applicableUserIds);
      if (shouldNotExistGroupIds.length !== 0 || shouldNotExistUserIds.length !== 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Prepare ComparableTarget
   * @returns Promise<ComparableAncestor>
   */
  private async generateComparableTarget(
      grant, grantedUserIds: ObjectId[] | undefined, grantedGroupId: ObjectId, includeApplicable: boolean,
  ): Promise<ComparableTarget> {
    if (includeApplicable) {
      const Page = mongoose.model('Page') as unknown as PageModel;
      const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

      let applicableUserIds: ObjectId[] | undefined;
      let applicableGroupIds: ObjectId[] | undefined;

      if (grant === Page.GRANT_USER_GROUP) {
        const targetUserGroup = await UserGroup.findOne({ _id: grantedGroupId });
        if (targetUserGroup == null) {
          throw Error('Target user group does not exist');
        }

        const relatedUsers = await UserGroupRelation.find({ relatedGroup: targetUserGroup._id });
        applicableUserIds = relatedUsers.map(u => u.relatedUser);

        const applicableGroups = grantedGroupId != null ? await UserGroup.findGroupsWithDescendantsById(grantedGroupId) : null;
        applicableGroupIds = applicableGroups?.map(g => g._id) || null;
      }

      return {
        grant,
        grantedUserIds,
        grantedGroupId,
        applicableUserIds,
        applicableGroupIds,
      };
    }

    return {
      grant,
      grantedUserIds,
      grantedGroupId,
    };
  }

  /**
   * Prepare ComparableAncestor
   * @param targetPath string of the target path
   * @returns Promise<ComparableAncestor>
   */
  private async generateComparableAncestor(targetPath: string): Promise<ComparableAncestor> {
    const Page = mongoose.model('Page') as unknown as PageModel;
    const UserGroupRelation = mongoose.model('UserGroupRelation') as any; // TODO: Typescriptize model

    let applicableUserIds: ObjectId[] | undefined;
    let applicableGroupIds: ObjectId[] | undefined;

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

    if (testAncestor.grant === Page.GRANT_USER_GROUP) {
      // make a set of all users
      const grantedRelations = await UserGroupRelation.find({ relatedGroup: testAncestor.grantedGroup }, { _id: 0, relatedUser: 1 });
      const grantedGroups = await UserGroup.findGroupsWithDescendantsById(testAncestor.grantedGroup);
      applicableGroupIds = grantedGroups.map(g => g._id);
      applicableUserIds = Array.from(new Set(grantedRelations.map(r => r.relatedUser))) as ObjectId[];
    }

    return {
      grant: testAncestor.grant,
      grantedUserIds: testAncestor.grantedUsers,
      applicableUserIds,
      applicableGroupIds,
    };
  }

  /**
   * Prepare ComparableDescendants
   * @param targetPath string of the target path
   * @returns ComparableDescendants
   */
  private async generateComparableDescendants(targetPath: string): Promise<ComparableDescendants> {
    const Page = mongoose.model('Page') as unknown as PageModel;

    /*
     * make granted users list of descendant's
     */
    const pathWithTrailingSlash = addTrailingSlash(targetPath);
    const startsPattern = escapeStringRegexp(pathWithTrailingSlash);

    const result = await Page.aggregate([
      { // match to descendants excluding empty pages
        $match: {
          path: new RegExp(`^${startsPattern}`),
          isEmpty: { $ne: true },
        },
      },
      {
        $project: {
          _id: 0,
          grant: 1,
          grantedUsers: 1,
          grantedGroup: 1,
        },
      },
      { // remove duplicates from pipeline
        $group: {
          _id: '$grant',
          grantedGroupSet: { $addToSet: '$grantedGroup' },
          grantedUsersSet: { $addToSet: '$grantedUsers' },
        },
      },
      { // flatten granted user set
        $unwind: {
          path: '$grantedUsersSet',
        },
      },
    ]);

    // GRANT_PUBLIC group
    const isPublicExist = result.some(r => r._id === Page.GRANT_PUBLIC);
    // GRANT_OWNER group
    const grantOwnerResult = result.filter(r => r._id === Page.GRANT_OWNER)[0]; // users of GRANT_OWNER
    const grantedUserIds: ObjectId[] = grantOwnerResult?.grantedUsersSet ?? [];
    // GRANT_USER_GROUP group
    const grantUserGroupResult = result.filter(r => r._id === Page.GRANT_USER_GROUP)[0]; // users of GRANT_OWNER
    const grantedGroupIds = grantUserGroupResult?.grantedGroupSet ?? [];

    return {
      isPublicExist,
      grantedUserIds,
      grantedGroupIds,
    };
  }

  /**
   * About the rule of validation, see: https://dev.growi.org/61b2cdabaa330ce7d8152844
   * @returns Promise<boolean>
   */
  async isGrantNormalized(
      targetPath: string, grant, grantedUserIds: ObjectId[] | undefined, grantedGroupId: ObjectId, shouldCheckDescendants = false,
  ): Promise<boolean> {
    if (isTopPage(targetPath)) {
      return true;
    }

    const comparableAncestor = await this.generateComparableAncestor(targetPath);

    if (!shouldCheckDescendants) { // checking the parent is enough
      const comparableTarget = await this.generateComparableTarget(grant, grantedUserIds, grantedGroupId, false);
      return this.processValidation(comparableTarget, comparableAncestor);
    }

    const comparableTarget = await this.generateComparableTarget(grant, grantedUserIds, grantedGroupId, true);
    const comparableDescendants = await this.generateComparableDescendants(targetPath);

    return this.processValidation(comparableTarget, comparableAncestor, comparableDescendants);
  }

}

export default PageGrantService;
