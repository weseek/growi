const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:healthcheck'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const helmet = require('helmet');

/**
 * @swagger
 *  tags:
 *    name: Statistics
 */

module.exports = (crowi) => {

  const models = crowi.models;
  const User = models.User;

  router.get('/user', helmet.noCache(), async(req, res) => {
    const activeUsersCount = await User.countListByStatus(User.STATUS_ACTIVE);
    const invitedUsersCount = await User.countListByStatus(User.STATUS_INVITED);
    const deletedUsersCount = await User.countListByStatus(User.STATUS_DELETED);
    const suspendedUsersCount = await User.countListByStatus(User.STATUS_SUSPENDED);
    const registeredUsersCount = await User.countListByStatus(User.STATUS_REGISTERED);
    const inactiveUsersCount = invitedUsersCount + deletedUsersCount + suspendedUsersCount + registeredUsersCount;
    const adminUsersCount = await new Promise((resolve, reject) => {
      User.findAdmins((err, admins) => {
        resolve(admins.length);
      });
    });

    const data = {
      total: activeUsersCount + inactiveUsersCount,
      active: {
        total: activeUsersCount,
        admin: adminUsersCount,
      },
      inactive: {
        total: inactiveUsersCount,
        // 以下ステータス別
        invited: invitedUsersCount,
        deleted: deletedUsersCount,
        suspended: suspendedUsersCount,
        registered: registeredUsersCount,
      },
    };

    res.status(200).send({ data });
  });

  return router;
};
