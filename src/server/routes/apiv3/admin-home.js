const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: adminHome
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      SystemInformationParams:
 *        type: object
 *        properties:
 *          growiVersion:
 *            type: String
 *            description: version of growi
 *          nodeVersion:
 *            type: String
 *            description: version of node
 *          npmVersion:
 *            type: String
 *            description: version of npm
 *          yarnVersion:
 *            type: String
 *            description: version of yarn
 *      InstalledPluginsParams:
 *        type: object
 *        properties:
 *          installedPlugins:
 *            type: object
 *            description: installed plugins
 */

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middleware/login-required')(crowi);
  const adminRequired = require('../../middleware/admin-required')(crowi);

  /**
   * @swagger
   *
   *    /admin-home/:
   *      get:
   *        tags: [adminHome]
   *        description: Get adminHome paramaters
   *        responses:
   *          200:
   *            description: params of adminHome
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    adminHomeParams:
   *                      type: object
   *                      description: adminHome params
   */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const adminHomeParams = {
      growiVersion: 'x.y.x',
      nodeVersion: 'x.y.x',
      npmVersion: 'x.y.x',
      yarnVersion: 'x.y.x',
      installedPlugins: { ex: 'x.y.z' },
    };

    return res.apiv3({ adminHomeParams });
  });

  return router;
};
