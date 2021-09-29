import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:export-job');

const express = require('express');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  /**
   * @swagger
   *
   *  /export-jobs:
   *    post:
   *      tags: [Export]
   *      operationId: createExportJob
   *      summary: /export-jobs
   *      description: create export job
   *      requestBody:
   *        required: true
   *        content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    type: number
   *                  format:
   *                    type: string
   *                required:
   *                  - pageId
   *                  - format
   *      responses:
   *        200:
   *          description: Job successfully created
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  status:
   *                    $ref: '#/components/schemas/ExportStatus'
   */
  router.post('/', accessTokenParser, loginRequired, csrf, async(req, res) => {
    // TODO: WIP
    try {
      const { format, pageId } = req.body;

      return res.apiv3({});
    }
    catch (err) {
      logger.error(err);
      const msg = 'Error occurred when starting export';
      return res.apiv3Err(new ErrorV3(msg, 'starting-export-failed'));
    }
  });

  return router;
};
