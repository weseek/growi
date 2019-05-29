/* eslint-disable no-use-before-define */
module.exports = (crowi) => {
  const logger = require('@alias/logger')('growi:routes:apiv3:user-group');
  const ApiResponse = require('../../util/apiResponse');

  const { UserGroupRelation, UserGroup } = crowi.models;

  const api = {};

  api.find = async(req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await UserGroup.findUserGroupsWithPagination({ page });
      // const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);
      const userGroups = result.docs;

      const userGroupRelationsObj = {};
      await Promise.all(userGroups.map(async(userGroup) => {
        const userGroupRelations = await UserGroupRelation.findAllRelationForUserGroup(userGroup);
        userGroupRelationsObj[userGroup._id] = userGroupRelations.map((userGroupRelation) => {
          return userGroupRelation.relatedUser;
        });
      }));

      const data = {
        userGroupRelations: userGroupRelationsObj,
      };

      return res.json(ApiResponse.success(data));
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error('Error occurred in fetching user group relations'));
    }
  };

  // const MAX_PAGE_LIST = 50;

  // function createPager(total, limit, page, pagesCount, maxPageList) {
  //   const pager = {
  //     page,
  //     pagesCount,
  //     pages: [],
  //     total,
  //     previous: null,
  //     previousDots: false,
  //     next: null,
  //     nextDots: false,
  //   };

  //   if (page > 1) {
  //     pager.previous = page - 1;
  //   }

  //   if (page < pagesCount) {
  //     pager.next = page + 1;
  //   }

  //   let pagerMin = Math.max(1, Math.ceil(page - maxPageList / 2));
  //   let pagerMax = Math.min(pagesCount, Math.floor(page + maxPageList / 2));
  //   if (pagerMin === 1) {
  //     if (MAX_PAGE_LIST < pagesCount) {
  //       pagerMax = MAX_PAGE_LIST;
  //     }
  //     else {
  //       pagerMax = pagesCount;
  //     }
  //   }
  //   if (pagerMax === pagesCount) {
  //     if ((pagerMax - MAX_PAGE_LIST) < 1) {
  //       pagerMin = 1;
  //     }
  //     else {
  //       pagerMin = pagerMax - MAX_PAGE_LIST;
  //     }
  //   }

  //   pager.previousDots = null;
  //   if (pagerMin > 1) {
  //     pager.previousDots = true;
  //   }

  //   pager.nextDots = null;
  //   if (pagerMax < pagesCount) {
  //     pager.nextDots = true;
  //   }

  //   for (let i = pagerMin; i <= pagerMax; i++) {
  //     pager.pages.push(i);
  //   }

  //   return pager;
  // }

  return api;
};
