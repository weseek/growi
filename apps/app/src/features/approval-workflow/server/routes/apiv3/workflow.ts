import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';
import { param, query, body } from 'express-validator';

import Crowi from '~/server/crowi';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { configManager } from '~/server/service/config-manager';
import XssService from '~/services/xss';
import loggerFactory from '~/utils/logger';

import { WorkflowStatus, WorkflowApproverStatus } from '../../../interfaces/workflow';
import { serializeWorkflowSecurely } from '../../models/serializers/workflow-serializer';
import Workflow from '../../models/workflow';
import { WorkflowService } from '../../services/workflow';


const logger = loggerFactory('growi:routes:apiv3:workflow');
const router = express.Router();

type RequestWithUser = Request & { user: IUserHasId }

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
    updateWorkflow: [
      param('workflowId').isMongoId().withMessage('workflowId is required'),
      body('name').optional().isString().withMessage('name must be a string'),
      body('comment').optional().isString().withMessage('comment must be a string'),
      body('createApproverGroupData').optional().isArray().withMessage('createApproverGroupData must be an array'),
      body('updateApproverGroupData').optional().isArray().withMessage('updateApproverGroupData must be an array'),
    ],
    updateWorkflowApproverStatus: [
      param('workflowId').isMongoId().withMessage('workflowId is required'),
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

    const workflow = await Workflow.findById(workflowId)
      .populate('creator')
      .populate('approverGroups.approvers.user');

    if (workflow == null) {
      return res.apiv3Err('Target workflow does not exist');
    }

    const serializedWorkflow = serializeWorkflowSecurely(workflow);

    return res.apiv3({ workflow: serializedWorkflow });
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
      const paginateResult = await (Workflow as any).paginate(
        { pageId },
        {
          limit,
          offset,
          populate: 'creator',
          sort: { createdAt: -1 }, // Sort by date in order of newest to oldest
        },
      );

      paginateResult.docs.forEach((doc) => {
        serializeWorkflowSecurely(doc, true);
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
      approverGroups,
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
   *                title:
   *                  type: string
   *                comment:
   *                  type: string
   *                approverGroupData:
   *                  type: array
   *
   *      responses:
   *        200:
   *          description: Succeeded to update Workflow
   */
  router.put('/:workflowId', accessTokenParser, loginRequired, validator.updateWorkflow, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const { workflowId } = req.params;
      const {
        name, comment, createApproverGroupData, updateApproverGroupData,
      } = req.body;
      const { user } = req;

      const isValid = [name, comment, createApproverGroupData, updateApproverGroupData].some(v => v != null);
      if (!isValid) {
        return res.apiv3Err('At least one of "name", "comment", "createApproverGroupData" or "updateApproverGroupData" must have a valid value');
      }

      if (createApproverGroupData != null) {
        const groupIndices = createApproverGroupData.map(v => v.groupIndex);
        const hasDuplicateGroupIndices = new Set(groupIndices).size !== groupIndices.length;
        if (hasDuplicateGroupIndices) {
          return res.apiv3Err('Cannot specify duplicate values for "groupId" within updateApproverGroupData');
        }
      }

      if (updateApproverGroupData != null) {
        const groupIds = updateApproverGroupData.map(v => v.groupId);
        const hasDuplicateGroupIds = new Set(groupIds).size !== groupIds.length;
        if (hasDuplicateGroupIds) {
          return res.apiv3Err('Cannot specify duplicate values for "groupId" within updateApproverGroupData');
        }
      }

      const xssProcessedName = xss.process(name);
      const xssProcessedComment = xss.process(comment);

      try {
        const updatedWorkflow = await WorkflowService.updateWorkflow(
          workflowId,
          user,
          xssProcessedName,
          xssProcessedComment,
          createApproverGroupData,
          updateApproverGroupData,
        );
        return res.apiv3({ updatedWorkflow });
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

      const { workflowId } = req.params;
      const { approverStatus, delegatedUserId } = req.body;
      const { user } = req;

      try {
        let updatedWorkflow;
        switch (approverStatus) {
          case WorkflowApproverStatus.APPROVE:
            updatedWorkflow = await WorkflowService.approve(workflowId, user._id.toString());
            break;
          case WorkflowApproverStatus.DELEGATE:
            break;
          case WorkflowApproverStatus.REMAND:
            break;
          default:
            return res.apiv3Err('approverStatus can be "APPROVE", "REMAND" or "DELEGATE"');
        }
        return res.apiv3({ updatedWorkflow });
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
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
      const { user } = req;

      try {
        const workflow = await Workflow.findById(workflowId);
        if (workflow == null) {
          return res.apiv3Err('Target workflow does not exist');
        }

        WorkflowService.validateOperatableUser(workflow, user);
        await WorkflowService.deleteWorkflow(workflowId);

        return res.apiv3();
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err);
      }
    });

  return router;
};
