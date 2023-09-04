import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';
import { param, body } from 'express-validator';

import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


import type { ApiV3Response } from './interfaces/apiv3-response';


const router = express.Router();

type RequestWithUser = Request & { user?: IUserHasId }


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
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const validator = {
    getWorkflow: [
      param('id').isMongoId().withMessage('id is required'),
    ],
    getWorkflows: [
      param('pageId').isMongoId().withMessage('pageId is required'),
    ],
    createWorkflow: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('name').isString().withMessage('name is required'),
      body('comment').isString().withMessage('comment is required'),
      body('approverGroups').isArray().withMessage('approverGroups is required'),
    ],
    updateWorkflowApproverGroups: [
      body('id').isMongoId().withMessage('id is required'),
      body('isNew').optional().isBoolean().withMessage('isNew must be  boolean'),
      body('approverGroup').isArray().withMessage('approverGroups is required'),
      body('approverGroupOffset').isInt().withMessage('approverGroupOffset is required'),
    ],
    updateWorkflowApproverStatus: [
      body('id').isMongoId().withMessage('id is required'),
      body('approverStatus').isString().withMessage('approverStatus is required'),
    ],
    deleteWorkflow: [
      param('id').isMongoId().withMessage('id is required'),
    ],
  };


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/{id}:
   *      get:
   *        tags: [Workflow]
   *        summary: Get workflow data
   *
   *        parameters:
   *          - name: id
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
  router.get('/:id', accessTokenParser, loginRequired, validator.getWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { id } = req.params;

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

    return res.apiv3();
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/create:
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
   *                  required: true
   *                comment:
   *                  description: Workflow comment
   *                  type: string
   *                  required: true
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
  router.post('/create', accessTokenParser, loginRequired, validator.createWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const {
      pageId,
      name,
      comment,
      approverGroups,
    } = req.body;
    const { user } = req;

    return res.apiv3();
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/update-approver-groups:
   *      post:
   *        tags: [Workflow]
   *        summary: Update WorkflowApproverGroup
   *
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                id:
   *                  description: WorkflowId to be updated
   *                  type: string
   *                  required: true
   *                isNew:
   *                  description: Whether it's a new creation or not.
   *                  type: boolean
   *                approverGroup:
   *                  descriotion: WorkflowApproverGroup
   *                  $ref: '#/components/schemas/workflowApproverGroup'
   *                  required: true
   *                approverGroupOffset:
   *                  description: Position of Workflow.approverGroups (Array) when updating or creating
   *                  type: number
   *                  required: true
   *
   *      responses:
   *        200:
   *          description: Succeeded to update WorkflowApproverGroup
   */
  router.post('/update-approver-group', accessTokenParser, loginRequired, validator.updateWorkflowApproverGroups, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const {
        id, isNew, approverGroup, approverGroupOffset,
      } = req.body;

      return res.apiv3();
    });


  /**
   * @swagger
   *
   *  paths:
   *    /update-approver-status:
   *      post:
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
   *                id:
   *                  description: WorkflowId to be updated
   *                  type: string
   *                  required: true
   *                approverStatus:
   *                  description: WorkflowApproverStatus
   *                  type: string
   *                  required: true
   *
   *      responses:
   *        200:
   *          description: Succeeded to update WorkflowApproverStatus
   */
  router.post('/update-approver-status', accessTokenParser, loginRequired, validator.updateWorkflowApproverStatus, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const { id, approverStatus } = req.body;
      const { user } = req;

      return res.apiv3();
    });


  /**
  * @swagger
  *  paths
  *    /workflow/{id}:
  *      delete:
  *        tags: [Workflow]
  *        description: Delete one workflow
  *
  *        parameters:
  *          - name: id
  *            in: path
  *            required: true
  *            description: ID of workflow
  *            schema:
  *              type: string
  *        responses:
  *          200:
  *            description: Succeeded to delete one workflow
  */
  router.delete('/:id', accessTokenParser, loginRequired, validator.deleteWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { id } = req.params;

    return res.apiv3();
  });

  return router;
};
