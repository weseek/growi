import mongoose from 'mongoose';

import {
  IWorkflow, WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
} from '~/interfaces/workflow';
import Workflow from '~/server/models/workflow';

import { WorkflowService } from './workflow';


let page1;

let creator;
let approver1;
let approver2;

describe('WorkflowService', () => {

  beforeAll(async() => {
    // page
    page1 = new mongoose.Types.ObjectId();

    // user
    creator = new mongoose.Types.ObjectId();
    approver1 = new mongoose.Types.ObjectId();
    approver2 = new mongoose.Types.ObjectId();
  });

  describe('.createWorkflow', () => {
    test('Should be able to create a workflow', async() => {

      const workflow: IWorkflow = {
        creator: creator._id,
        pageId: page1._id,
        status: WorkflowStatus.INPROGRESS,
        name: 'page1 workflow',
        comment: 'comment',
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver1.status,
                status:  WorkflowApproverStatus.NONE,
              },
              {
                user: approver2.status,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ] as any,
      };

      // when
      const createdWorkflow = await WorkflowService.createWorkflow(workflow);

      // then
      expect(createdWorkflow).toBeInstanceOf(Workflow);
    });

    test('Should fail when attempting to create multiple in-progress workflows on single page', async() => {

      // setup
      const workflow: IWorkflow = {
        creator: creator._id,
        pageId: page1._id,
        status: WorkflowStatus.INPROGRESS,
        name: 'page1 workflow',
        comment: 'comment',
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver1.status,
                status:  WorkflowApproverStatus.NONE,
              },
              {
                user: approver2.status,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ] as any,
      };

      // when
      const result = WorkflowService.createWorkflow(workflow);

      // then
      await expect(result).rejects.toThrow('An in-progress workflow already exists');
    });


    describe('.validateApproverGroups', () => {
      test('Should fail when setting approverGroup.approveType to "OR" when approverGroup.approvers.length is 1', () => {

        // setup
        const approverGroups = [
          {
            approvalType: WorkflowApprovalType.OR,
            approvers: [
              {
                user: creator,
              },
            ],
          },
        ] as any;

        // when
        const caller = () => WorkflowService.validateApproverGroups(true, creator._id, approverGroups);

        // then
        expect(caller).toThrow('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
      });

      test('Should fail when attempting to set a user as an approver who is already an approver', () => {

        // setup
        const approverGroups = [
          {
            approvalType: WorkflowApprovalType.OR,
            approvers: [
              {
                user: approver1,
              },
              {
                user: approver1,
              },
            ],
          },
        ] as any;

        // when
        const caller = () => WorkflowService.validateApproverGroups(true, creator._id, approverGroups);

        // then
        expect(caller).toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
      });

      test('Should fail when attempting to set the workflow creator as an approver', () => {

        // setup
        const approverGroups = [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: creator,
              },
            ],
          },
        ] as any;

        // when
        const caller = () => WorkflowService.validateApproverGroups(true, creator._id, approverGroups);

        // then
        expect(caller).toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
      });

      test('Should fail when setting approver.status to anything other than "NONE" during workflow creation', () => {

        // setup
        const approverGroups = [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver1,
                status: 'APPROVE',
              },
            ],
          },
        ] as any;

        // when
        const caller = () => WorkflowService.validateApproverGroups(true, creator._id, approverGroups);

        // then
        expect(caller).toThrow('Cannot set approver.status to anything other than "NONE" during creation');
      });
    });
  });
});
