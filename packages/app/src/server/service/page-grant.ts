import mongoose from 'mongoose';
import { pagePathUtils } from '@growi/core';

import UserGroup from '~/server/models/user-group';
import { PageModel } from '~/server/models/page';
import { PageQueryBuilder } from '../models/obsolete-page';
import { isIncludesObjectId, removeDuplicates, excludeTestIdsFromTargetIds } from '~/server/util/compare-objectId';

const { isTopPage } = pagePathUtils;

type ObjectId = mongoose.Types.ObjectId;

type ComparableTarget = {
  grant: number,
  grantedUserIds: ObjectId[],
  grantedGroupId: ObjectId,
  applicableGroupIds?: ObjectId[],
};

type ComparableAncestor = {
  grant: number,
  grantedUserIds: ObjectId[],
  applicableUserIds?: ObjectId[],
  applicableGroupIds?: ObjectId[],
};

type ComparableDescendants = {
  grantedUserIds: ObjectId[],
  descendantGroupIds: ObjectId[],
};

class PageGrantService {

  crowi!: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  private validateComparableTarget(comparable: ComparableTarget) {
    const Page = mongoose.model('Page') as PageModel;

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

    const Page = mongoose.model('Page') as PageModel;

    /*
     * ancestor side
     */
    // GRANT_PUBLIC
    if (ancestor.grant === Page.GRANT_PUBLIC) {
      // DO NOTHING
    }
    // GRANT_OWNER
    if (ancestor.grant === Page.GRANT_OWNER) {
      if (target.grant !== Page.GRANT_OWNER) {
        return false;
      }

      if (!ancestor.grantedUserIds[0].equals(target.grantedUserIds[0])) {
        return false;
      }
    }
    // GRANT_USER_GROUP
    if (ancestor.grant === Page.GRANT_USER_GROUP) {
      if (ancestor.applicableGroupIds == null || ancestor.applicableUserIds == null) {
        throw Error('applicableGroupIds and applicableUserIds are not specified');
      }

      if (target.grant === Page.GRANT_PUBLIC) {
        return false;
      }

      if (target.grant === Page.GRANT_OWNER) {
        if (!isIncludesObjectId(ancestor.applicableUserIds, target.grantedUserIds[0])) {
          return false;
        }
      }

      if (target.grant === Page.GRANT_USER_GROUP) {
        if (!isIncludesObjectId(ancestor.applicableGroupIds, target.grantedGroupId)) {
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

    if (target.applicableGroupIds == null) {
      throw Error('applicableGroupIds must not be null');
    }

    // GRANT_PUBLIC
    if (target.grant === Page.GRANT_PUBLIC) {
      if (descendants.descendantGroupIds.length !== 0 || descendants.descendantGroupIds.length !== 0) {
        return false;
      }
    }
    // GRANT_OWNER
    if (target.grant === Page.GRANT_OWNER) {
      if (descendants.descendantGroupIds.length !== 0 || descendants.grantedUserIds.length > 1) {
        return false;
      }

      if (descendants.grantedUserIds.length === 1 && descendants.grantedUserIds[0].equals(target.grantedGroupId)) {
        return false;
      }
    }
    // GRANT_USER_GROUP
    if (target.grant === Page.GRANT_USER_GROUP) {
      const shouldNotExistIds = excludeTestIdsFromTargetIds(descendants.descendantGroupIds, target.applicableGroupIds);
      if (shouldNotExistIds.length !== 0) {
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
      grant, grantedUserIds: ObjectId[], grantedGroupId: ObjectId, includeApplicable: boolean,
  ): Promise<ComparableTarget> {
    if (includeApplicable) {
      const applicableGroups = await UserGroup.findGroupsWithDescendantsById(grantedGroupId);
      const applicableGroupIds = applicableGroups.map(g => g._id);


      return {
        grant,
        grantedUserIds,
        grantedGroupId,
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
    const Page = mongoose.model('Page') as PageModel;
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
    const Page = mongoose.model('Page') as PageModel;

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
    const grantedGroups: ObjectId[] = [];
    descendants.forEach((d) => {
      if (d.grantedUsers != null) {
        grantedUsersOfGrantOwner = grantedUsersOfGrantOwner.concat(d.grantedUsers);
      }
      if (d.grantedGroup != null) {
        grantedGroups.push(d.grantedGroup);
      }
    });

    const descendantGroupIds = removeDuplicates(grantedGroups);
    return {
      grantedUserIds: grantedUsersOfGrantOwner,
      descendantGroupIds,
    };
  }

  /**
   * About the rule of validation, see: https://dev.growi.org/61b2cdabaa330ce7d8152844
   * @returns Promise<boolean>
   */
  async isGrantNormalized(targetPath: string, grant, grantedUserIds: ObjectId[], grantedGroupId: ObjectId, shouldCheckDescendants = false): Promise<boolean> {
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
