import { S3ServiceException } from '@aws-sdk/client-s3';
import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import ExportArchiveDataPage from '~/components/Admin/ExportArchiveDataPage';

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
    const approverGroupId4 = new mongoose.Types.ObjectId().toString();
    const approverGroupId5 = new mongoose.Types.ObjectId().toString();

    const approverId1 = new mongoose.Types.ObjectId().toString();
    const approverId2 = new mongoose.Types.ObjectId().toString();
    const approverId3 = new mongoose.Types.ObjectId().toString();
    const approverId4 = new mongoose.Types.ObjectId().toString();
    const approverId5 = new mongoose.Types.ObjectId().toString();
    const approverId6 = new mongoose.Types.ObjectId().toString();
    const approverId7 = new mongoose.Types.ObjectId().toString();
    const approverId8 = new mongoose.Types.ObjectId().toString();
    const approverId9 = new mongoose.Types.ObjectId().toString();
    const approverId10 = new mongoose.Types.ObjectId().toString();

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
          {
            _id: approverGroupId4,
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approverId7,
                status: WorkflowApproverStatus.NONE,
              },
              {
                user: approverId8,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
          {
            _id: approverGroupId5,
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approverId9,
                status: WorkflowApproverStatus.NONE,
              },
              {
                user: approverId10,
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

    it('Update approverGroup', async() => {
      // setup
      const approverIdtoAdd1 = new mongoose.Types.ObjectId().toString();
      const approverIdtoAdd2 = new mongoose.Types.ObjectId().toString();

      const targetWorkflow = await Workflow.findById(workflowId);
      const targetApproverGroup3 = targetWorkflow?.findApproverGroup(approverGroupId3);
      const targetApproverGroup4 = targetWorkflow?.findApproverGroup(approverGroupId4);
      const targetApproverGroup5 = targetWorkflow?.findApproverGroup(approverGroupId5);

      const targetApproverToAdd1 = (targetApproverGroup4 as any).findApprover(approverIdtoAdd1);
      const targetApproverToAdd2 = (targetApproverGroup4 as any).findApprover(approverIdtoAdd2);

      const targetApproverToRemove1 = (targetApproverGroup4 as any).findApprover(approverId7);
      const targetApproverToRemove2 = (targetApproverGroup4 as any).findApprover(approverId8);

      expect(targetApproverGroup3?.isApproved).toEqual(false);
      expect(targetApproverToAdd1).toBeUndefined();
      expect(targetApproverToAdd2).toBeUndefined();
      expect(targetApproverToRemove1.status).toEqual(WorkflowApproverStatus.NONE);
      expect(targetApproverToRemove2.status).toEqual(WorkflowApproverStatus.NONE);
      expect(targetApproverGroup5?.approvalType).toEqual(WorkflowApprovalType.AND);

      const approverGroupData = [
        {
          groupId: approverGroupId3,
          shouldRemove: true,
        },
        {
          groupId: approverGroupId4,
          shouldRemove: false,
          userIdsToAdd: [approverIdtoAdd1, approverIdtoAdd2],
          userIdsToRemove: [approverId7, approverId8],
        },
        {
          groupId: approverGroupId5,
          shouldRemove: false,
          approvalType: WorkflowApprovalType.OR,
        },
      ];

      // when
      const updatedWorkflow = await WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', approverGroupData);

      // then
      const updatedTargetApproverGroup3 = (updatedWorkflow as any).findApproverGroup(approverGroupId3);
      const updatedTargetApproverGroup4 = (updatedWorkflow as any).findApproverGroup(approverGroupId4);
      const updatedTargetApproverGroup5 = (updatedWorkflow as any).findApproverGroup(approverGroupId5);

      const updatedTargetApproverToAdd1 = (updatedTargetApproverGroup4 as any).findApprover(approverIdtoAdd1);
      const updatedTargetApproverToAdd2 = (updatedTargetApproverGroup4 as any).findApprover(approverIdtoAdd2);

      const updatedTargetApproverToRemove1 = (updatedTargetApproverGroup4 as any).findApprover(approverId7);
      const updatedTargetApproverToRemove2 = (updatedTargetApproverGroup4 as any).findApprover(approverId8);

      expect(updatedTargetApproverGroup3).toBeUndefined();
      expect(updatedTargetApproverToAdd1.status).toEqual(WorkflowApproverStatus.NONE);
      expect(updatedTargetApproverToAdd2.status).toEqual(WorkflowApproverStatus.NONE);
      expect(updatedTargetApproverToRemove1).toBeUndefined();
      expect(updatedTargetApproverToRemove2).toBeUndefined();
      expect(updatedTargetApproverGroup5?.approvalType).toEqual(WorkflowApprovalType.OR);
    });
  });
});
