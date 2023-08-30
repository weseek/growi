import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

const router = express.Router();

type RequestWithUser = Request & { user?: IUserHasId }

module.exports = (crowi: Crowi): Router => {

  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);


  // description: workflowId を受け取り、対象の workflow document を返却する
  router.get('/:workflowId', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId } = req.params;

    return res.apiv3();
  });


  // description: pageId を受け取り、対象ページに付随する workflow document を配列で返却する
  router.get('/list/:pageId', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const { pageId } = req.params;

    return res.apiv3();
  });


  // description: Workflow.status が "inprogress" な Workflow document を作成, 作成された Workflow document を返却する
  router.post('/create', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const {
      pageId,
      workflowName,
      workflowComment,
      workflowTask,
    } = req.body;
    const { user } = req;

    return res.apiv3();
  });


  // description: workflowId と workflowTasks を受け取り、対象 workflow document の workflow.tasks の更新を行う
  router.post('/update', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId, workflowTasks } = req.body;

    return res.apiv3();
  });


  // description: approver のアクション ("approve", "remand" など) を行うためのエンドポイント。workflowId を受け取り、対象の workflow 内の自身の approver.status を更新する
  router.post('/action', accessTokenParser, loginRequired, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId } = req.body;
    const { user } = req;

    return res.apiv3();
  });

  return router;
};
