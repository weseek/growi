import ConfigLoader from '../../service/config-loader';

const express = require('express');

const router = express.Router();

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
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

  /**
   * @swagger
   *
   *    /admin-home/:
   *      get:
   *        tags: [Admin]
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
      envVars: await ConfigLoader.getEnvVarsForDisplay(true),
      isV5Compatible: crowi.configManager.getConfig('crowi', 'app:isV5Compatible'),
      isMaintenanceMode: crowi.configManager.getConfig('crowi', 'app:isMaintenanceMode'),
    };

    return res.apiv3({ adminHomeParams });
  });

  return router;
};
