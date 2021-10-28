import { InAppNotification } from '../../models/in-app-notification';
import { InAppNotification as IInAppNotification } from '../../../interfaces/in-app-notification';

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


    const getActionUsersFromActivities = function(activities) {
      return activities.map(({ user }) => user).filter((user, i, self) => self.indexOf(user) === i);
    };

    let docObj: IInAppNotification;
    const serializedDocs: Array<IInAppNotification> = [];

    paginationResult.docs.forEach((doc, i) => {
      if (doc.user != null && doc.user instanceof User) {
        doc.user = serializeUserSecurely(doc.user);
      }

      docObj = doc.toObject();
      const actionUsersNew = getActionUsersFromActivities(doc.activities);

      const serializedActionUsers = actionUsersNew.map((actionUser) => {
        return serializeUserSecurely(actionUser);
      });

      docObj.actionUsers = serializedActionUsers;

      serializedDocs.push(docObj);
    });

    const serializedPaginationResult = {
      docs: serializedDocs,
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

    return res.apiv3(serializedPaginationResult);
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
