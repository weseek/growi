import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

const router = express.Router();

type RequestWithUser = Request & { user?: IUserHasId }

module.exports = (crowi: Crowi): Router => {

  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);


  // description: パスパラメーターで pageId を受け取り、対象ページに付随する workflow データを返却する
  router.get('/list/:pageId', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const { pageId } = req.params;

    return res.apiv3();
  });

  // description: Workflow.status が "inprogress" な Workflow document を作成, 作成された Workflow document を返却する
  router.post('/', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const {
      pageId,
      workflowName,
      workflowComment,
      workflowTask,
    } = req.body;
    const { user } = req;

    return res.apiv3();
  });

  // wokflow の更新
  router.post('/update', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    return res.apiv3();
  });

  // workflow の削除
  router.delete('/', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    return res.apiv3();
  });

  return router;
};
