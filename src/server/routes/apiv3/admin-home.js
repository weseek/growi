const express = require('express');
const PluginUtils = require('../../plugins/plugin-utils');

const pluginUtils = new PluginUtils();

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
 *            type: string
 *            description: version of growi
 *          nodeVersion:
 *            type: string
 *            description: version of node
 *          npmVersion:
 *            type: string
 *            description: version of npm
 *          yarnVersion:
 *            type: string
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
   *        tags: [AdminHome]
   *        operationId: getAdminHome
   *        summary: /admin-home
   *        description: Get adminHome parameters
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
      growiVersion: crowi.version,
      nodeVersion: crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : '-',
      npmVersion: crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : '-',
      yarnVersion: crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version.version : '-',
      installedPlugins: pluginUtils.listPlugins(crowi.rootDir),
    };

    return res.apiv3({ adminHomeParams });
  });

  return router;
};
