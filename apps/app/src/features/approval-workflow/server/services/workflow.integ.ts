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
    // const approvedWorkflowId = new mongoose.Types.ObjectId().toString();

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
      await Workflow.insertMany([
        {
          _id: workflowId,
          creator: creator._id,
          pageId: new mongoose.Types.ObjectId(),
          name: 'In-progress Workflow',
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
        },
        // {
        //   _id: approvedWorkflowId,
        //   creator: creator._id,
        //   pageId: new mongoose.Types.ObjectId(),
        //   name: 'Approved Workflow',
        //   comment: 'commnet',
        //   status: WorkflowStatus.APPROVE,
        //   approverGroups: [
        //     {
        //       _id: approverGroupId1,
        //       approvalType: WorkflowApprovalType.OR,
        //       approvers: [
        //         {
        //           user: approverId1,
        //           status: WorkflowApproverStatus.APPROVE,
        //         },
        //         {
        //           user: approverId2,
        //           status: WorkflowApproverStatus.NONE,
        //         },
        //       ],
        //     },
        //   ],
        // },
      ]);
    });

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    // it('Should fail if a non-existent workflowId is provided', () => {
    //   // setup
    //   const nonExistWorkflowId = new mongoose.Types.ObjectId().toString();

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(nonExistWorkflowId, creator, 'name', 'comment', undefined, undefined);

    //   // then
    //   expect(caller).rejects.toThrow('Target workflow does not exist');
    // });

    // it('Should fail when trying to edit a workflow that is not in progress', () => {
    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(approvedWorkflowId, creator, 'name', 'comment', undefined, undefined);

    //   // then
    //   expect(caller).rejects.toThrow('Cannot edit workflows that are not in progress');
    // });

    // it('Should fail when the target approverGroup does not exist', () => {
    //   // setup
    //   const nonExistApproverGroupId = new mongoose.Types.ObjectId().toString();
    //   const updateApproverGroupData = [
    //     {
    //       groupId: nonExistApproverGroupId,
    //       shouldRemove: true,
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', undefined, updateApproverGroupData);

    //   // then
    //   expect(caller).rejects.toThrow('Target approevrGroup does not exist');
    // });

    // it('Should fail if there is an approved approverGroup before the target approverGroup (when updating a group) ', () => {
    //   // setup
    //   const updateApproverGroupData = [
    //     {
    //       groupId: approverGroupId1,
    //       shouldRemove: true,
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', undefined, updateApproverGroupData);

    //   // then
    //   expect(caller).rejects.toThrow('Cannot edit approverGroups prior to the approved approverGroup');
    // });

    // it('Should fail if there is an approved approverGroup before the target approverGroup (When adding a group) ', () => {
    //   // setup
    //   const createApproverGroupData = [
    //     {
    //       groupIndex: 0,
    //       approvalType: WorkflowApprovalType.AND,
    //       userIdsToAdd: [new mongoose.Types.ObjectId().toString()],
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', createApproverGroupData, undefined);

    //   // then
    //   expect(caller).rejects.toThrow('Cannot edit approverGroups prior to the approved approverGroup');
    // });

    // it('Should fail if there are approved approvers within the approverGroup being deleted', () => {
    //   // setup
    //   const approverGroupData = [
    //     {
    //       groupId: approverGroupId2,
    //       shouldRemove: true,
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', undefined, approverGroupData);

    //   // then
    //   expect(caller).rejects.toThrow('Cannot remove an approverGroup that contains approved approvers');
    // });

    // it('Should fail if the approver to be deleted does not exist', () => {
    //   // setup
    //   const approverGroupData = [
    //     {
    //       groupId: approverGroupId2,
    //       userIdsToRemove: [new mongoose.Types.ObjectId().toString()],
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', undefined, approverGroupData);

    //   // then
    //   expect(caller).rejects.toThrow('Target approver does not exist');
    // });

    // it('Should fail if the approver to be deleted is approved', () => {
    //   // setup
    //   const approverGroupData = [
    //     {
    //       groupId: approverGroupId2,
    //       userIdsToRemove: [approverId3],
    //     },
    //   ];

    //   // when
    //   const caller = () => WorkflowService.updateWorkflow(workflowId, creator, 'name', 'comment', undefined, approverGroupData);

    //   // then
    //   expect(caller).rejects.toThrow('Cannot remove an approved apporver');
    // });

    it('Update approverGroup', async() => {
      // setup
      const approverIdToAdd1 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd2 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd3 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd4 = new mongoose.Types.ObjectId().toString();
      const approverIdToAdd5 = new mongoose.Types.ObjectId().toString();

      const updatedWorkflowName = 'Updated workflow name';
      const updatedWorkflowDescription = 'Updated workflow description';

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
          groupId: approverGroupId3,
          shouldRemove: true,
        },
        {
          groupId: approverGroupId4,
          userIdsToAdd: [approverIdToAdd4, approverIdToAdd5],
          userIdsToRemove: [approverId7, approverId8],
        },
        {
          groupId: approverGroupId5,
          approvalType: WorkflowApprovalType.OR,
        },
      ];

      // when
      const updatedWorkflow = await WorkflowService.updateWorkflow(
        workflowId,
        creator,
        updatedWorkflowName,
        updatedWorkflowDescription,
        createApproverGroupData,
        updateApproverGroupData,
      );


      // then
      const createdTargetApproverGroup1 = updatedWorkflow.approverGroups[1];
      const createdTargetApproverGroup2 = updatedWorkflow.approverGroups[3];

      const createdTargetApproverGroupApproverIds1 = createdTargetApproverGroup1.approvers.map(v => v.user.toString());
      const createdTargetApproverGroupApproverIds2 = createdTargetApproverGroup2.approvers.map(v => v.user.toString());

      const updatedTargetApproverGroup1 = (updatedWorkflow.approverGroups as any).id(approverGroupId3);

      const updatedTargetApproverGroup2 = (updatedWorkflow.approverGroups as any).id(approverGroupId4);
      const updatedTargetApproverGroup3 = (updatedWorkflow.approverGroups as any).id(approverGroupId5);

      const updatedTargetApproverToAdd1 = (updatedTargetApproverGroup2 as any).findApprover(approverIdToAdd4);
      const updatedTargetApproverToAdd2 = (updatedTargetApproverGroup2 as any).findApprover(approverIdToAdd5);

      const updatedTargetApproverToRemove1 = (updatedTargetApproverGroup2 as any).findApprover(approverId7);
      const updatedTargetApproverToRemove2 = (updatedTargetApproverGroup2 as any).findApprover(approverId8);

      expect(updatedWorkflow.name).toEqual(updatedWorkflowName);
      expect(updatedWorkflow.comment).toEqual(updatedWorkflowDescription);
      expect(createdTargetApproverGroup1.approvalType).toEqual(WorkflowApprovalType.AND);
      expect(createdTargetApproverGroup2.approvalType).toEqual(WorkflowApprovalType.OR);
      expect(createdTargetApproverGroupApproverIds1.includes(approverIdToAdd1)).toBe(true);
      expect(createdTargetApproverGroupApproverIds2.includes(approverIdToAdd2)).toBe(true);
      expect(createdTargetApproverGroupApproverIds2.includes(approverIdToAdd3)).toBe(true);
      expect(updatedTargetApproverGroup1).toBeNull();
      expect(updatedTargetApproverGroup1).toBeNull();
      expect(updatedTargetApproverToAdd1.status).toEqual(WorkflowApproverStatus.NONE);
      expect(updatedTargetApproverToAdd2.status).toEqual(WorkflowApproverStatus.NONE);
      expect(updatedTargetApproverToRemove1).toBeUndefined();
      expect(updatedTargetApproverToRemove2).toBeUndefined();
      expect(updatedTargetApproverGroup3?.approvalType).toEqual(WorkflowApprovalType.OR);
    });
  });
});
