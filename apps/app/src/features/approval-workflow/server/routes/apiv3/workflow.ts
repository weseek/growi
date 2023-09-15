import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';
import { param, query, body } from 'express-validator';
import mongoose from 'mongoose';

import Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { configManager } from '~/server/service/config-manager';
import XssService from '~/services/xss';
import loggerFactory from '~/utils/logger';

import { IWorkflowApproverGroupReq, IWorkflowPaginateResult, WorkflowStatus } from '../../../interfaces/workflow';
import Workflow from '../../models/workflow';
import { WorkflowService } from '../../services/workflow';


const logger = loggerFactory('growi:routes:apiv3:workflow');
const router = express.Router();

type RequestWithUser = Request & { user: IUserHasId }


// for PUT:/workflow/{workflowId}:
const actuonTypeForWorkflowApproverGroups = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

/**
 * @swagger
 *  tags:
 *    name: Workflow
 */


// TODO: Write properties
/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Workflow:
 *        description: Workflow
 *        type: object
 *        properties:
 *
 *      workflowApproverGroup:
 *        description: workflowApproverGroup
 *        type: object
 *        properties:
 */

module.exports = (crowi: Crowi): Router => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequired = require('~/server/middlewares/login-required')(crowi, true);

  const validator = {
    getWorkflow: [
      param('workflowId').isMongoId().withMessage('workflowId is required'),
    ],
    getWorkflows: [
      param('pageId').isMongoId().withMessage('pageId is required'),
      query('limit').optional().isInt().withMessage('limit must be a number'),
      query('offset').optional().isInt().withMessage('offset must be a number'),
    ],
    createWorkflow: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('name').optional().isString().withMessage('name must be string'),
      body('comment').optional().isString().withMessage('comment must be string'),
      body('approverGroups').isArray().withMessage('approverGroups is required'),
    ],
    updateWorkflowApproverGroups: [
      body('workflowId').isMongoId().withMessage('workflowId is required'),
      body('approverGroup').isObject().withMessage('approverGroups is required'),
      body('approverGroupOffset').isInt().withMessage('approverGroupOffset is required'),
      body('actionType').isString().withMessage('actionType is required'),
    ],
    updateWorkflowApproverStatus: [
      body('workflowId').isMongoId().withMessage('workflowId is required'),
      body('approverStatus').isString().withMessage('approverStatus is required'),
      body('delegatedUserId').optional().isMongoId().withMessage('delegatedUserId must be mongo id'),
    ],
    deleteWorkflow: [
      param('workflowId').isMongoId().withMessage('workflowId is required'),
    ],
  };

  const xss = new XssService();


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/{workflowId}:
   *      get:
   *        tags: [Workflow]
   *        summary: Get workflow data
   *
   *        parameters:
   *          - name: workflowId
   *            in: path
   *            description: id of workflow
   *            type: string
   *            required: true
   *
   *        responses:
   *          200:
   *            description: Workflow data
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Workflow'
   */
  router.get('/:workflowId', accessTokenParser, loginRequired, validator.getWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId } = req.params;

    // Description
    // workflowId に紐つく workflow を取得する

    return res.apiv3();
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/list/{pageId}:
   *      get:
   *        tags: [Workflow]
   *        summary: Get workflow list data from pageId
   *
   *        parameters:
   *          - name: pageId
   *            in: path
   *            description: pageId to rterieve a list of workflows
   *            type: string
   *            required: true
   *          - name: limit
   *            in: query
   *            type: number
   *          - name: offset
   *            in: query
   *            type: number
   *
   *        responses:
   *          200:
   *            description: Workflow list data
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    workflows:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/Workflow'
   */
  router.get('/list/:pageId', accessTokenParser, loginRequired, validator.getWorkflows, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { pageId } = req.params;

    const limit = req.query.limit || await configManager.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const offset = req.query.offset || 0;

    try {
      const paginateResult: IWorkflowPaginateResult = await (Workflow as any).paginate(
        { pageId },
        {
          limit,
          offset,
          populate: 'creator',
          sort: { createdAt: -1 }, // Sort by date in order of newest to oldest
        },
      );

      const User = mongoose.model('User');
      paginateResult.docs.forEach((doc) => {
        if (doc.creator != null && doc.creator instanceof User) {
          doc.creator = serializeUserSecurely(doc.creator);
        }
      });

      return res.apiv3({ paginateResult });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err);
    }
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow
   *      post:
   *        tags: [Workflow]
   *        summary: Create Workflow
   *
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                pageId:
   *                  description: id of page
   *                  type: string
   *                  required: true
   *                name:
   *                  description: Workflow name
   *                  type: string
   *                comment:
   *                  description: Workflow comment
   *                  type: string
   *                approverGroups:
   *                  descriotion: Workflow Approver Groups
   *                  type: array
   *                  required: true
   *                  items:
   *                    $ref: '#/components/schemas/workflowApproverGroup'
   *
   *      responses:
   *        200:
   *          description: Workflow data
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/Workflow'
   */
  router.post('/', accessTokenParser, loginRequired, validator.createWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const {
      pageId, name, comment, approverGroups,
    } = req.body;
    const { user } = req;

    const xssProcessedName = xss.process(name);
    const xssProcessedComment = xss.process(comment);

    const workflow = {
      pageId,
      creator: user._id,
      name: xssProcessedName,
      comment: xssProcessedComment,
      status: WorkflowStatus.INPROGRESS,
      approverGroups: approverGroups as IWorkflowApproverGroupReq[],
    };

    try {
      const createdWorkflow = await WorkflowService.createWorkflow(workflow);
      return res.apiv3({ createdWorkflow });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(err);
    }
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/{workflowId}:
   *      put:
   *        tags: [Workflow]
   *        summary: Update WorkflowApproverGroups
   *
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                workflowId:
   *                  description: WorkflowId to be updated
   *                  type: string
   *                  required: true
   *                approverGroup:
   *                  descriotion: WorkflowApproverGroup
   *                  $ref: '#/components/schemas/workflowApproverGroup'
   *                  required: true
   *                approverGroupOffset:
   *                  description: Position to create, update, and delete approverGroups in Workflow.approverGroups
   *                  type: number
   *                  required: true
   *                actionType:
   *                  description: Whether to create, update, or delete the approver group
   *                  type: string
   *                  required: true
   *
   *      responses:
   *        200:
   *          description: Succeeded to update WorkflowApproverGroup
   */
  router.put('/:workflowId', accessTokenParser, loginRequired, validator.updateWorkflowApproverGroups, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const {
        workflowId, approverGroup, approverGroupOffset, actionType,
      } = req.body;

      // Descirption
      // approverGroup の作成 or 更新 or 削除

      // Memo
      // actionType は actuonTypeForWorkflowApproverGroups に対応する
      // req.body.approverGroupOffset は workflow.approverGroups の配列のインデックス番号
      // req.body.actionType ごとに処理を分ける
      // workflow 自体が承認済みの場合は作成と更新と削除はできない
      // 承認済みの approverGroup 以前に作成と更新はできない

      return res.apiv3();
    });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/{workflowId}/status:
   *      put:
   *        tags: [Workflow]
   *        summary: Update WorkflowApproverStatus
   *
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                workflowId:
   *                  description: WorkflowId to be updated
   *                  type: string
   *                  required: true
   *                approverStatus:
   *                  description: WorkflowApproverStatus
   *                  type: string
   *                  required: true
   *                delegatedUserId:
   *                  description: userId for delegation if req.body.approverStatus is 'DELEGATE'.
   *                  type: string
   *
   *      responses:
   *        200:
   *          description: Succeeded to update WorkflowApproverStatus
   */
  router.put('/:workflowId/status', accessTokenParser, loginRequired, validator.updateWorkflowApproverStatus, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const { workflowId, approverStatus, delegatedUserId } = req.body;
      const { user } = req;

      // Descirption
      // approver の status の更新

      // Memo
      // 進行中の workflow 内の approver の status を更新することができる
      // req.body.approverStatus が "DELEGATE" だった場合は req.body.delegatedUserId が必須となる

      return res.apiv3();
    });


  /**
  * @swagger
  *  paths
  *    /workflow/{workflowId}:
  *      delete:
  *        tags: [Workflow]
  *        description: Delete one workflow
  *
  *        parameters:
  *          - name: workflowId
  *            in: path
  *            required: true
  *            description: ID of workflow
  *            schema:
  *              type: string
  *
  *        responses:
  *          200:
  *            description: Succeeded to delete one workflow
  */
  router.delete('/:workflowId', accessTokenParser, loginRequired, validator.deleteWorkflow, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const { workflowId } = req.params;

      // Description
      // workflow の削除

      // Memo
      // ワークフロー作成者 or 管理者権限を持つ user が削除できる

      return res.apiv3();
    });

  return router;
};
