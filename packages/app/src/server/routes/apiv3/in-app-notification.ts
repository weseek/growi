import { Request, Response } from 'express';
// import ApiResponse from 'server/util/apiResponse';
import Crowi from '../../crowi';

// export default (crowi: Crowi) => {
import { InAppNotification } from '../../models/in-app-notification';

const actions = {} as any;
actions.api = {} as any;

/**
   * @api {get} /notifications.list
   * @apiName ListNotifications
   * @apiGroup Notification
   *
   * @apiParam {String} linit
   */
actions.api.list = function(req: Request, res: Response) {
  const user = req.user/*  as UserDocument */;

  const limit = 10;
  if (req.query.limit) {
    // limit = parseInt(req.query.limit, 10);
  }

  const offset = 0;
  if (req.query.offset) {
    // offset = parseInt(req.query.offset, 10);
  }

  const requestLimit = limit + 1;

  InAppNotification.findLatestInAppNotificationsByUser(user._id, requestLimit, offset)
    .then((notifications) => {
      let hasPrev = false;
      if (offset > 0) {
        hasPrev = true;
      }

      let hasNext = false;
      if (notifications.length > limit) {
        hasNext = true;
      }

      const result = {
        notifications: notifications.slice(0, limit),
        hasPrev,
        hasNext,
      };

      return res.apiv3(result);
    })
    .catch((err) => {
      return res.apiv3Err(err);
    });
};

actions.api.read = function(req: Request, res: Response) {
  const user = req.user/* as UserDocument */;

  try {
    const notification = InAppNotification.read(user);
    const result = { notification };
    return res.apiv3(result);
  }
  catch (err) {
    return res.apiv3Err(err);
  }
};

actions.api.open = async function(req: Request, res: Response) {
  const user = req.user/* as UserDocument */;
  const id = req.body.id;

  try {
    const notification = await InAppNotification.open(user, id);
    const result = { notification };
    return res.apiv3(result);
  }
  catch (err) {
    return res.apiv3Err(err);
  }
};

actions.api.status = async function(req: Request, res: Response) {
  const user = req.user/* as UserDocument */;

  try {
    const count = await InAppNotification.getUnreadCountByUser(user._id);
    const result = { count };
    return res.apiv3(result);
  }
  catch (err) {
    return res.apiv3Err(err);
  }
};
