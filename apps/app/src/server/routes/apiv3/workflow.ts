import { ErrorV3 } from '@growi/core/dist/models';
import express, { Request, Router } from 'express';

import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:workflow');
const router = express.Router();

type FormRequest = Request & { form: any, logIn: any };

module.exports = (crowi: Crowi): Router => {

  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  /**
   * @swagger
   *
   *  paths:
   *    /workflow/list/{pageId}:
   *      get:
   *        tags: [Workflows]
   *        operationId: getPageWorkflowsList
   *        description: Get Workflows Present Within the Page
   *        parameters:
   *          - name: pageId
   *            in: path
   *            required: true
   *            description: pageId to get the workflow
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Revoke user read only access success
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    workflowData:
   *                      type: object
   */
  router.get('/list/:pageId', async(req: FormRequest, res: ApiV3Response) => {
    // パスパラメーターで pageId を受け取り、対象ページに付随する workflow データを返却する
    const { pageId } = req.params;

    return res.apiv3();
  });

  router.post('/', async(req: FormRequest, res: ApiV3Response) => {
    return res.apiv3();
  });

  // wokflow の更新
  router.post('/update', async(req: FormRequest, res: ApiV3Response) => {
    return res.apiv3();
  });

  // workflow の削除
  router.delete('/', async(req: FormRequest, res: ApiV3Response) => {
    return res.apiv3();
  });

  return router;
};
