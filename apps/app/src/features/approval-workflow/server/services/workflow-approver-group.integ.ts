import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import {
  WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

import { WorkflowApproverGroupService } from './workflow-approver-group';


describe('WorkflowApproverGroupService', () => {

  describe('.updateApproverGroup', () => {

    const creator = { _id: new mongoose.Types.ObjectId() } as unknown as IUserHasId;

    const workflowId = new mongoose.Types.ObjectId().toString();

    const approverGroupId1 = new mongoose.Types.ObjectId().toString();
    const approverGroupId2 = new mongoose.Types.ObjectId().toString();

    const approverId1 = new mongoose.Types.ObjectId().toString();
    const approverId2 = new mongoose.Types.ObjectId().toString();
    const approverId3 = new mongoose.Types.ObjectId().toString();
    const approverId4 = new mongoose.Types.ObjectId().toString();

    beforeAll(async() => {
      await Workflow.create(
        {
          _id: workflowId,
          creator: creator._id,
          pageId: new mongoose.Types.ObjectId(),
          name: 'workflow name',
          comment: 'workflow comment',
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
          ],
        },
      );
    });

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should fail when the target approverGroup does not exist', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const nonExistApproverGroupId = new mongoose.Types.ObjectId().toString();
      const updateApproverGroupData = [
        {
          groupId: nonExistApproverGroupId,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.updateApproverGroup(targetWorkflow as any, updateApproverGroupData);

      // then
      expect(caller).toThrow('Target approevrGroup does not exist');
    });

    it('Should fail if there is an approved approverGroup before the target approverGroup (when updating a group) ', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const updateApproverGroupData = [
        {
          groupId: approverGroupId1,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.updateApproverGroup(targetWorkflow as any, updateApproverGroupData);

      // then
      expect(caller).toThrow('Cannot edit approverGroups prior to the approved approverGroup');
    });

    it('Should fail if there is an approved approverGroup before the target approverGroup (When adding a group) ', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const createApproverGroupData = [
        {
          groupIndex: 0,
          approvalType: WorkflowApprovalType.AND,
          userIdsToAdd: [new mongoose.Types.ObjectId().toString()],
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.createApproverGroup(targetWorkflow as any, createApproverGroupData);

      // then
      expect(caller).toThrow('Cannot edit approverGroups prior to the approved approverGroup');
    });

    it('Should fail if there are approved approvers within the approverGroup being deleted', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const updateApproverGroupData = [
        {
          groupId: approverGroupId2,
          shouldRemove: true,
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.updateApproverGroup(targetWorkflow as any, updateApproverGroupData);

      // then
      expect(caller).toThrow('Cannot remove an approverGroup that contains approved approvers');
    });

    it('Should fail if the approver to be deleted does not exist', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const updateApproverGroupData = [
        {
          groupId: approverGroupId2,
          userIdsToRemove: [new mongoose.Types.ObjectId().toString()],
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.updateApproverGroup(targetWorkflow as any, updateApproverGroupData);

      // then
      expect(caller).toThrow('Target approver does not exist');
    });

    it('Should fail if the approver to be deleted is approved', async() => {
      // setup
      const targetWorkflow = await Workflow.findById(workflowId);

      const updateApproverGroupData = [
        {
          groupId: approverGroupId2,
          userIdsToRemove: [approverId3],
        },
      ];

      // when
      const caller = () => WorkflowApproverGroupService.updateApproverGroup(targetWorkflow as any, updateApproverGroupData);

      // then
      expect(caller).toThrow('Cannot remove an approved apporver');
    });
  });
});
