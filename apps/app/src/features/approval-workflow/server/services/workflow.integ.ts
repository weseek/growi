import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import {
  WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

import { WorkflowService } from './workflow';


describe('WorkflowService', () => {

  describe('.createWorkflow', () => {
    const workflow = {
      creator: new mongoose.Types.ObjectId(),
      pageId: new mongoose.Types.ObjectId(),
      status: WorkflowStatus.INPROGRESS,
      name: 'page1 workflow',
      comment: 'comment',
      approverGroups: [
        {
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: new mongoose.Types.ObjectId(),
              status:  WorkflowApproverStatus.NONE,
            },
          ],
        },
      ],
    };

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should be able to create a workflow', async() => {
      // when
      const createdWorkflow = await WorkflowService.createWorkflow(workflow);

      // then
      expect(createdWorkflow).toBeInstanceOf(Workflow);
    });

    it('Should fail when attempting to create multiple in-progress workflows on single page', async() => {
      // when
      const result = WorkflowService.createWorkflow(workflow);

      // then
      await expect(result).rejects.toThrow('An in-progress workflow already exists');
    });
  });


  describe('.validateDeletableTaraget', () => {
    // workflow
    const workflowId1 = new mongoose.Types.ObjectId();
    const workflowId2 = new mongoose.Types.ObjectId();

    // user
    const workflowCreatorId = new mongoose.Types.ObjectId();
    const workflowCreator = { _id: workflowCreatorId.toString() } as IUserHasId;

    const nonWorkflowCreator = { _id: new mongoose.Types.ObjectId().toString() } as IUserHasId;

    const nonAdminUser = { _id: new mongoose.Types.ObjectId().toString(), admin: false } as IUserHasId;

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId1,
        creator: workflowCreator,
        pageId: new mongoose.Types.ObjectId(),
        name: 'page1 Workflow',
        comment: 'commnet',
        status: WorkflowStatus.INPROGRESS,
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: new mongoose.Types.ObjectId(),
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      });
    });

    it('Should fail when an non-existent workflowId is provided', () => {
      // when
      const caller = () => WorkflowService.validateDeletableTaraget(workflowId2, workflowCreator);

      // then
      expect(caller).rejects.toThrow('Target workflow does not exist');
    });

    it('Should fail when a non-Workflow Creator user attempts deletion', () => {
      // when
      const caller = () => WorkflowService.validateDeletableTaraget(workflowId1, nonWorkflowCreator);

      // then
      expect(caller).rejects.toThrow('Users with workflow creator or administrator privileges can perform the deletion');
    });

    it('Should fail when user who is neither Workflow Creator or Admin User attempts deletion', () => {
      // when
      const caller = () => WorkflowService.validateDeletableTaraget(workflowId1, nonAdminUser);

      // then
      expect(caller).rejects.toThrow('Users with workflow creator or administrator privileges can perform the deletion');
    });
  });

  describe('.deleteWorkflow', () => {

    // workflow
    const workflowId = new mongoose.Types.ObjectId();

    // user
    const workflowCreatorId = new mongoose.Types.ObjectId();
    const workflowCreator = { _id: workflowCreatorId.toString() } as IUserHasId;

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId,
        creator: workflowCreator,
        pageId: new mongoose.Types.ObjectId(),
        name: 'page1 Workflow',
        comment: 'commnet',
        status: WorkflowStatus.INPROGRESS,
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: new mongoose.Types.ObjectId(),
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      });
    });

    it('Should allow workflow creator to delete the workflow', async() => {
      // setup
      expect(await Workflow.exists(workflowId)).not.toBeNull();

      // when
      await WorkflowService.deleteWorkflow(workflowId, workflowCreator);

      // then
      expect(await Workflow.exists(workflowId)).toBeNull();
    });
  });
});
