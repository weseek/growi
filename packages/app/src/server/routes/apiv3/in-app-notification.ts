import { IInAppNotification } from '../../../interfaces/in-app-notification';

const express = require('express');
const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

const router = express.Router();


module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const inAppNotificationService = crowi.inAppNotificationService;
  const User = crowi.model('User');

  router.get('/list', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;

    const limit = parseInt(req.query.limit) || 10;

    let offset = 0;
    if (req.query.offset) {
      offset = parseInt(req.query.offset, 10);
    }

    const queryOptions = {
      offset,
      limit,
    };

    // set in-app-notification status to categorize
    if (req.query.status != null) {
      Object.assign(queryOptions, { status: req.query.status });
    }

    const paginationResult = await inAppNotificationService.getLatestNotificationsByUser(user._id, queryOptions);


    const getActionUsersFromActivities = function(activities) {
      return activities.map(({ user }) => user).filter((user, i, self) => self.indexOf(user) === i);
    };

    const serializedDocs: Array<IInAppNotification> = paginationResult.docs.map((doc) => {
      if (doc.user != null && doc.user instanceof User) {
        doc.user = serializeUserSecurely(doc.user);
      }
      // To add a new property into mongoose doc, need to change the format of doc to an object
      const docObj: IInAppNotification = doc.toObject();
      const actionUsersNew = getActionUsersFromActivities(doc.activities);

      const serializedActionUsers = actionUsersNew.map((actionUser) => {
        return serializeUserSecurely(actionUser);
      });

      docObj.actionUsers = serializedActionUsers;
      return docObj;
    });

    const serializedPaginationResult = {
      ...paginationResult,
      docs: serializedDocs,
    };

    return res.apiv3(serializedPaginationResult);
  });

  router.get('/status', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const userId = req.user._id;
    try {
      const count = await inAppNotificationService.getUnreadCountByUser(userId);
      return res.apiv3({ count });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/read', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;

    try {
      await inAppNotificationService.read(user);
      return res.apiv3();
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/open', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;
    const id = req.body.id;

    try {
      const notification = await inAppNotificationService.open(user, id);
      const result = { notification };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/all-statuses-open', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;

    try {
      await inAppNotificationService.updateAllNotificationsAsOpened(user);
      return res.apiv3();
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
