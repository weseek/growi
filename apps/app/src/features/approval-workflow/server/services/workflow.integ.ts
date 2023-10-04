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

  describe('.deleteWorkflow', () => {

    // workflow
    const workflowId1 = new mongoose.Types.ObjectId();
    const workflowId2 = new mongoose.Types.ObjectId();

    // user
    const workflowCreatorId = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId2,
        creator: workflowCreatorId,
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

    it('Should fail if a non-existent workflowId is provided', async() => {
      // when
      const caller = () => WorkflowService.deleteWorkflow(workflowId1);

      // then
      expect(caller).rejects.toThrow('Target workflow does not exist');
    });

    it('Should allow workflow creator to delete the workflow', async() => {
      // setup
      expect(await Workflow.exists(workflowId2)).not.toBeNull();

      // when
      await WorkflowService.deleteWorkflow(workflowId2);

      // then
      expect(await Workflow.exists(workflowId2)).toBeNull();
    });
  });

  describe('.updateWorkflow', () => {
    const creator = { _id: new mongoose.Types.ObjectId() } as unknown as IUserHasId;

    const workflowId = new mongoose.Types.ObjectId().toString();

    const approverGroupId1 = new mongoose.Types.ObjectId().toString();
    const approverGroupId2 = new mongoose.Types.ObjectId().toString();
    const approverGroupId3 = new mongoose.Types.ObjectId().toString();

    const approverId1 = new mongoose.Types.ObjectId().toString();
    const approverId2 = new mongoose.Types.ObjectId().toString();
    const approverId3 = new mongoose.Types.ObjectId().toString();
    const approverId4 = new mongoose.Types.ObjectId().toString();
    const approverId5 = new mongoose.Types.ObjectId().toString();
    const approverId6 = new mongoose.Types.ObjectId().toString();

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId,
        creator: creator._id,
        pageId: new mongoose.Types.ObjectId(),
        name: 'page1 Workflow',
        comment: 'commnet',
        status: WorkflowStatus.INPROGRESS,
        approverGroups: [
          {
            _id: approverGroupId1,
            approvalType: WorkflowApprovalType.OR,
            approvers: [
              {
                user: approverId1,
                status: WorkflowApproverStatus.APPROVE,
              },
              {
                user: approverId2,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
          {
            _id: approverGroupId2,
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approverId3,
                status: WorkflowApproverStatus.APPROVE,
              },
              {
                user: approverId4,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
          {
            _id: approverGroupId3,
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approverId5,
                status: WorkflowApproverStatus.NONE,
              },
              {
                user: approverId6,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      });
    });

    it('Should fail if a non-existent workflowId is provided', () => {
      // setup
      const nonExistWorkflowId = new mongoose.Types.ObjectId().toString();

      // when
      const caller = () => WorkflowService.updateWorkflow(nonExistWorkflowId, creator, 'name', 'comment', undefined);

      // then
      expect(caller).rejects.toThrow('Target workflow does not exist');
    });

    it('Should fail when trying to edit a workflow that is not in progress', () => {
      // wip
    });

    it('Should fail when the target approverGroup does not exist', () => {
      // setup
      const nonExistApproverGroupId = new mongoose.Types.ObjectId().toString();
      const approverGroupData = [
        {
          groupId: nonExistApproverGroupId,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      expect(caller).rejects.toThrow('Target approevrGroup does not exist');
    });

    it('Should fail if there is an approved approverGroup before the target approverGroup', () => {
      // setup
      const approverGroupData = [
        {
          groupId: approverGroupId1,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      expect(caller).rejects.toThrow('Cannot edit approverGroups prior to the approved approverGroup');
    });

    it('Should fail if there are approved approvers within the approverGroup being deleted', () => {
      // setup
      const approverGroupData = [
        {
          groupId: approverGroupId2,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      expect(caller).rejects.toThrow('Cannot remove an approverGroup that contains approved approvers');
    });

    it('Should fail if the approver to be deleted does not exist', () => {
      // setup
      const approverGroupData = [
        {
          groupId: approverGroupId2,
          shouldRemove: false,
          userIdsToRemove: [new mongoose.Types.ObjectId().toString()],
        },
      ];

      // when
      const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      expect(caller).rejects.toThrow('Target approver does not exist');
    });

    it('Should fail if the approver to be deleted is approved', () => {
      // setup
      const approverGroupData = [
        {
          groupId: approverGroupId2,
          shouldRemove: false,
          userIdsToRemove: [approverId3],
        },
      ];

      // when
      const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      expect(caller).rejects.toThrow('Cannot remove an approved apporver');
    });
  });
});
