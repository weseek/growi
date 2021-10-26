import { InAppNotification } from '../../models/in-app-notification';

const express = require('express');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

const router = express.Router();


module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const inAppNotificationService = crowi.inAppNotificationService;
  const User = crowi.model('User');

  router.get('/list', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;

    let limit = 10;
    if (req.query.limit) {
      limit = parseInt(req.query.limit, 10);
    }

    let offset = 0;
    if (req.query.offset) {
      offset = parseInt(req.query.offset, 10);
    }

    const requestLimit = limit + 1;

    const paginationResult = await inAppNotificationService.getLatestNotificationsByUser(user._id, requestLimit, offset);

    interface IdocType {
      status: string,
      _id: string
      action: string,
      target: [],
      user: typeof User,
      createdAt: Date,
      targetModel: string,
      actionUsers: Array<typeof User>,
      id: string,
    }

    interface InewPaginationResult {
      docs: Array<IdocType | null>,
      totalDocs: number,
      offset: number,
      limit: number,
      totalPages: number,
      page: number,
      pagingCounter: number,
      hasPrevPage: boolean,
      hasNextPage: boolean,
      prevPage: number | null,
      nextPage: number | null,
    }

    const newPaginationResult: InewPaginationResult = {
      docs: [],
      totalDocs: paginationResult.totalDocs,
      offset: paginationResult.offset,
      limit: paginationResult.limit,
      totalPages: paginationResult.totalPages,
      page: paginationResult.page,
      pagingCounter: paginationResult.pagingCounter,
      hasPrevPage: paginationResult.hasPrevPage,
      hasNextPage: paginationResult.hasNextPage,
      prevPage: paginationResult.prevPage,
      nextPage: paginationResult.nextPage,
    };


    paginationResult.docs.forEach((doc) => {
      let seriarizedUser;
      if (doc.user != null && doc.user instanceof User) {
        seriarizedUser = serializeUserSecurely(doc.user);
      }

      const serializedActionUsers = doc.actionUsers.map((actionUser) => {
        return serializeUserSecurely(actionUser);
      });

      console.log('serializedActionUsers', serializedActionUsers);

      newPaginationResult.docs.push({
        status: doc.status,
        _id: doc._id,
        action: doc.action,
        target: doc.target,
        user: seriarizedUser,
        createdAt: doc.createdAt,
        targetModel: doc.targetModel,
        actionUsers: serializedActionUsers,
        id: doc.status,
      });


      console.log('serializedActionUsers', serializedActionUsers);

      // console.log('newPaginationResult', newPaginationResult);
    });

    return res.apiv3(newPaginationResult);

  });

  router.get('/status', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const userId = req.user._id;
    try {
      const count = await inAppNotificationService.getUnreadCountByUser(userId);
      const result = { count };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/read', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const user = req.user;

    try {
      await inAppNotificationService.read(user);
      return res.apiv3();
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/open', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const user = req.user;
    const id = req.body.id;

    try {
      const notification = await InAppNotification.open(user, id);
      const result = { notification };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
