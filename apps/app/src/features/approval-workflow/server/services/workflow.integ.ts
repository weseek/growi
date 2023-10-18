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
    const approvedWorkflowId = new mongoose.Types.ObjectId().toString();

    const workflowName = 'workflow name';
    const workflowComment = 'workflo comment';

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
      await Workflow.insertMany([
        {
          _id: workflowId,
          creator: creator._id,
          pageId: new mongoose.Types.ObjectId(),
          name: workflowName,
          comment: workflowComment,
          status: WorkflowStatus.INPROGRESS,
          approverGroups: [
            {
              _id: approverGroupId1,
              approvalType: WorkflowApprovalType.AND,
              approvers: [
                {
                  user: approverId1,
                  status: WorkflowApproverStatus.NONE,
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
                  status: WorkflowApproverStatus.NONE,
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
        },
        {
          _id: approvedWorkflowId,
          creator: creator._id,
          pageId: new mongoose.Types.ObjectId(),
          name: 'Approved Workflow',
          comment: 'commnet',
          status: WorkflowStatus.APPROVE,
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
          ],
        },
      ]);
    });

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should fail if a non-existent workflowId is provided', () => {
      // setup
      const nonExistWorkflowId = new mongoose.Types.ObjectId().toString();

      // when
      const caller = () => WorkflowService.updateWorkflow(nonExistWorkflowId, creator, 'name', 'comment', undefined, undefined);

      // then
      expect(caller).rejects.toThrow('Target workflow does not exist');
    });

    it('Should fail when trying to edit a workflow that is not in progress', () => {
      // when
      const caller = () => WorkflowService.updateWorkflow(approvedWorkflowId, creator, 'name', 'comment', undefined, undefined);

      // then
      expect(caller).rejects.toThrow('Cannot edit workflows that are not in progress');
    });

    it('Update approverGroup', async() => {
      // setup
      const approverIdToAdd1 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd2 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd3 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd4 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd5 = new mongoose.Types.ObjectId().toString();

      const updatedWorkflowName = 'Updated workflow name';
      const updatedWorkflowComment = 'Updated workflow comment';

      const createApproverGroupData = [
        {
          groupIndex: 1,
          approvalType: WorkflowApprovalType.AND,
          userIdsToAdd: [approverIdToAdd1],
        },
        {
          groupIndex: 3,
          approvalType: WorkflowApprovalType.OR,
          userIdsToAdd: [approverIdToAdd2, approverIdToAdd3],
        },
      ];

      const updateApproverGroupData = [
        {
          groupId: approverGroupId1,
          shouldRemove: true,
        },
        {
          groupId: approverGroupId2,
          userIdsToAdd: [approverIdToAdd4, approverIdToAdd5],
          userIdsToRemove: [approverId3, approverId4],
        },
        {
          groupId: approverGroupId3,
          approvalType: WorkflowApprovalType.OR,
        },
      ];

      const previousWorkflow = await Workflow.findById(workflowId);

      const previousApproverGroup1 = previousWorkflow?.approverGroups[0];
      const previousApproverGroup2 = previousWorkflow?.approverGroups[1];
      const previousApproverGroup3 = (previousWorkflow?.approverGroups as any).id(approverGroupId1);
      const previousApproverGroup4 = (previousWorkflow?.approverGroups as any).id(approverGroupId2);
      const previousApproverGroup5 = (previousWorkflow?.approverGroups as any).id(approverGroupId3);

      expect(previousWorkflow?.name).toEqual(workflowName);
      expect(previousWorkflow?.comment).toEqual(workflowComment);
      expect((previousApproverGroup1 as any).findApprover(approverIdToAdd1)).toBeUndefined();
      expect((previousApproverGroup2 as any).findApprover(approverIdToAdd2)).toBeUndefined();
      expect((previousApproverGroup2 as any).findApprover(approverIdToAdd3)).toBeUndefined();
      expect(previousApproverGroup3).not.toBeNull();
      expect(previousApproverGroup4.findApprover(approverIdToAdd4)).toBeUndefined();
      expect(previousApproverGroup4.findApprover(approverIdToAdd5)).toBeUndefined();
      expect(previousApproverGroup4.findApprover(approverId3)).not.toBeUndefined();
      expect(previousApproverGroup4.findApprover(approverId4)).not.toBeUndefined();
      expect(previousApproverGroup5.approvalType).toEqual(WorkflowApprovalType.AND);

      // when
      const updatedWorkflow = await WorkflowService.updateWorkflow(
        workflowId,
        creator,
        updatedWorkflowName,
        updatedWorkflowComment,
        createApproverGroupData,
        updateApproverGroupData,
      );

      // then
      const updatedApproverGroup1 = updatedWorkflow?.approverGroups[0];
      const updatedApproverGroup2 = updatedWorkflow?.approverGroups[1];
      const updatedApproverGroup3 = (updatedWorkflow?.approverGroups as any).id(approverGroupId1);
      const updatedApproverGroup4 = (updatedWorkflow?.approverGroups as any).id(approverGroupId2);
      const updatedApproverGroup5 = (updatedWorkflow?.approverGroups as any).id(approverGroupId3);

      expect(updatedWorkflow?.name).toEqual(updatedWorkflowName);
      expect(updatedWorkflow?.comment).toEqual(updatedWorkflowComment);
      expect((updatedApproverGroup1 as any).findApprover(approverIdToAdd1)).not.toBeUndefined();
      expect((updatedApproverGroup2 as any).findApprover(approverIdToAdd2)).not.toBeUndefined();
      expect((updatedApproverGroup2 as any).findApprover(approverIdToAdd3)).not.toBeUndefined();
      expect(updatedApproverGroup3).toBeNull();
      expect(updatedApproverGroup4.findApprover(approverIdToAdd4)).not.toBeUndefined();
      expect(updatedApproverGroup4.findApprover(approverIdToAdd5)).not.toBeUndefined();
      expect(updatedApproverGroup4.findApprover(approverId3)).toBeUndefined();
      expect(updatedApproverGroup4.findApprover(approverId4)).toBeUndefined();
      expect(updatedApproverGroup5.approvalType).toEqual(WorkflowApprovalType.OR);
    });
  });
});
