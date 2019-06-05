const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:user-group-relation'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const ErrorV3 = require('../../util/ErrorV3');
const {
  accessTokenParser,
  loginRequired,
  adminRequired,
} = require('../../util/middlewares');


module.exports = (crowi) => {
  const { UserGroup, UserGroupRelation } = crowi.models;

  router.use('/', accessTokenParser(crowi));

  router.get('/', loginRequired(crowi), adminRequired(), async(req, res) => {
    // TODO: filter with querystring? or body
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

      return res.apiv3(data);
    }
    catch (err) {
      const msg = 'Error occurred in fetching user group relations';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'user-group-relation-list-fetch-failed'));
    }
  });

  return router;
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
