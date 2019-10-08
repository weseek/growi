const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:healthcheck'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const helmet = require('helmet');

const USER_STATUS_MASTER = {
  1: 'registered',
  2: 'active',
  3: 'suspended',
  4: 'deleted',
  5: 'invited',
};


/**
 * @swagger
 *  tags:
 *    name: Statistics
 */
module.exports = (crowi) => {

  const models = crowi.models;
  const User = models.User;
  const util = require('util');

  router.get('/user', helmet.noCache(), async(req, res) => {
    const userCountGroupByStatus = await User.aggregate().group({
      _id: '$status',
      totalCount: { $sum: 1 },
    });

    const userCountResults = {
      active: 0,
      invited: 0,
      deleted: 0,
      suspended: 0,
      registered: 0,
    };

    userCountGroupByStatus.forEach((userCount) => {
      const key = USER_STATUS_MASTER[userCount._id];
      userCountResults[key] = userCount.totalCount;
    });
    const activeUserCount = userCountResults.active;

    delete userCountResults.active;

    userCountResults.total = userCountResults.invited + userCountResults.deleted + userCountResults.suspended + userCountResults.registered;

    const findAdmins = util.promisify(User.findAdmins).bind(User);
    const adminUsers = await findAdmins();

    const data = {
      total: activeUserCount + userCountResults.total,
      active: {
        total: activeUserCount,
        admin: adminUsers.length,
      },
      inactive: userCountResults,
    };
    res.status(200).send({ data });
  });

  return router;
};
