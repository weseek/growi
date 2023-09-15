import { IUserHasId } from '@growi/core';
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

  describe('.deleteWorkflow', () => {

    // // workflow
    const workflowId1 = new mongoose.Types.ObjectId();

    // // user
    const creator = new mongoose.Types.ObjectId() as unknown as IUserHasId;
    const user = new mongoose.Types.ObjectId() as unknown as IUserHasId;

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId1,
        creator,
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

    it('Should fail when user who is neither Workflow Creator or Admin User attempts deletion', () => {
      // when
      const caller = () => WorkflowService.deleteWorkflow(workflowId1, user);

      // then
      expect(caller).rejects.toThrow('error message');
    });

    it('Should be able to delete the workflow if the user is either the Workflow Creator or an Admin User', async() => {
      // when
      await WorkflowService.deleteWorkflow(workflowId1, creator);

      // then
      const workflow = await Workflow.findOne({ _id: workflowId1 });
      expect(workflow).toBe(null);
    });
  });
});
