const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:healthcheck'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

const helmet = require('helmet');

const util = require('util');

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

  const getUserStatistics = async() => {
    const userCountGroupByStatus = await User.aggregate().group({
      _id: '$status',
      totalCount: { $sum: 1 },
    });

    // Initialize userCountResults with 0
    const userCountResults = {};
    Object.values(USER_STATUS_MASTER).forEach((status) => {
      userCountResults[status] = 0;
    });

    userCountGroupByStatus.forEach((userCount) => {
      const key = USER_STATUS_MASTER[userCount._id];
      userCountResults[key] = userCount.totalCount;
    });
    const activeUserCount = userCountResults.active;

    // Use userCountResults for inactive users, so delete unnecessary active
    delete userCountResults.active;

    // Calculate the total number of inactive users
    const inactiveUserTotal = userCountResults.invited + userCountResults.deleted + userCountResults.suspended + userCountResults.registered;

    // Get admin users
    const findAdmins = util.promisify(User.findAdmins).bind(User);
    const adminUsers = await findAdmins();

    return {
      total: activeUserCount + inactiveUserTotal,
      active: {
        total: activeUserCount,
        admin: adminUsers.length,
      },
      inactive: {
        total: inactiveUserTotal,
        ...userCountResults,
      },
    };
  };

  const getUserStatisticsForNotLoggedIn = async() => {
    const data = await getUserStatistics();
    delete data.active.admin;
    delete data.inactive.invited;
    delete data.inactive.deleted;
    delete data.inactive.suspended;
    delete data.inactive.registered;
    return data;
  };

  /**
   * @swagger
   *
   *  /statistics/user:
   *    get:
   *      tags: [Statistics]
   *      description: Get statistics for user
   *      responses:
   *        200:
   *          description: Statistics for user
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  data:
   *                    type: object
   *                    description: Statistics for all user
   */
  router.get('/user', helmet.noCache(), async(req, res) => {
    const data = req.user == null ? await getUserStatisticsForNotLoggedIn() : await getUserStatistics();
    res.status(200).send({ data });
  });

  return router;
};
