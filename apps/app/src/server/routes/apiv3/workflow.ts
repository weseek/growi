import type { IUserHasId } from '@growi/core';
import express, { Request, Router } from 'express';
import { body } from 'express-validator';

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
 *      WorkflowTask:
 *        description: WorkflowTask
 *        type: object
 *        properties:
 */

module.exports = (crowi: Crowi): Router => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const validator = {
    createWorkflow: [
      body('pageId').isMongoId().withMessage('pageId is required'),
      body('workflowName').isString().withMessage('workflowName is required'),
      body('workflowComment').isString().withMessage('workflowComment is required'),
      body('workflowTasks').isArray().withMessage('workflowTask is required'),
    ],
    updateWorkflow: [
      body('workflowId').isMongoId().withMessage('workflowId is required'),
      body('workflowTasks').isArray().withMessage('workflowTasks is required'),
    ],
    updateWorkflowAction: [
      body('workflowId').isMongoId().withMessage('workflowId is required'),
      body('workflowApproverStatus').isString().withMessage('workflowApproverStatus is required'),
    ],
  };


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/{workflowId}:
   *      get:
   *        tags: [Workflow]
   *        summary: Get workflow data from workflowId
   *
   *        parameters:
   *          - name: workflowId
   *            in: path
   *            description: id of workflow data to be retrieved
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
  router.get('/:workflowId', accessTokenParser, loginRequired, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId } = req.params;

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
  router.get('/list/:pageId', accessTokenParser, loginRequired, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
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
   *                  description: pageId for Workflow creation
   *                  type: string
   *                workflowName:
   *                  description: workflow name
   *                  type: string
   *                workflowComment:
   *                  description: workflow comment
   *                  type: string
   *                workflowTasks:
   *                  descriotion: workflow tasks
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/WorkflowTask'
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
      workflowName,
      workflowComment,
      workflowTasks,
    } = req.body;
    const { user } = req;

    return res.apiv3();
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/update:
   *      post:
   *        tags: [Workflow]
   *        summary: Update Workflow
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
   *                workflowTasks:
   *                  descriotion: workflow tasks
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/WorkflowTask'
   *
   *      responses:
   *        200:
   *          description: Workflow data
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/Workflow'
   */
  router.post('/update', accessTokenParser, loginRequired, validator.updateWorkflow, apiV3FormValidator, async(req: RequestWithUser, res: ApiV3Response) => {
    const { workflowId, workflowTasks } = req.body;

    return res.apiv3();
  });


  /**
   * @swagger
   *
   *  paths:
   *    /workflow/action:
   *      post:
   *        tags: [Workflow]
   *        summary: Update WorkflowApprover status
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
   *                workflowApproverStatus:
   *                  description: WorkflowApprover status
   *                  type: string
   *
   *      responses:
   *        200:
   *          description: Succeeded to update approver status
   */
  router.post('/action', accessTokenParser, loginRequired, validator.updateWorkflowAction, apiV3FormValidator,
    async(req: RequestWithUser, res: ApiV3Response) => {
      const { workflowId, workflowApproverStatus } = req.body;
      const { user } = req;

      return res.apiv3();
    });

  return router;
};
