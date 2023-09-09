import mongoose from 'mongoose';

import { WorkflowApprovalType } from '../../../src/interfaces/workflow';
import Workflow from '../../../src/server/models/workflow';
import { getInstance } from '../setup-crowi';


let page1;
let page2;
let creator;
let approver1;
let approver2;

describe('WorkflowService', () => {
  let crowi;

  beforeAll(async() => {
    crowi = await getInstance();

    // page
    page1 = new mongoose.Types.ObjectId();
    page2 = new mongoose.Types.ObjectId();

    // user
    creator = new mongoose.Types.ObjectId();
    approver1 = new mongoose.Types.ObjectId();
    approver2 = new mongoose.Types.ObjectId();
  });

  describe('createWorkflow()', () => {
    test('Create a workflow using createWorkflow()', async() => {
      // setup
      const approverGroups = [
        {
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: approver1,
            },
            {
              user: approver2,
            },
          ],
        },
      ];

      // when
      const createdWorkflow = await crowi.workflowService.createWorkflow(creator, page1, 'page1 workflow', 'comment', approverGroups);

      // then
      expect(createdWorkflow).toBeInstanceOf(Workflow);
    });

    test('Fail to create multiple in-progress workflows for a single page fail', async() => {

      // setup
      const approverGroups = [
        {
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: approver1,
            },
            {
              user: approver2,
            },
          ],
        },
      ];

      // when
      const result = crowi.workflowService.createWorkflow(creator, page1, 'page1 workflow', 'comment', approverGroups);

      // then
      await expect(result).rejects.toThrow('An in-progress workflow already exists');
    });


    test('If approverGroup.approvers.length is 1, setting approverGroup.approveType to "OR" will fail', async() => {

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
      ];

      // when
      const result = crowi.workflowService.createWorkflow(creator, page2, 'page2 workflow', 'comment', approverGroups);

      // then
      await expect(result).rejects.toThrow('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
    });

    test('Fail to attempting to set the same approver', async() => {

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
      ];

      // when
      const result = crowi.workflowService.createWorkflow(creator, page2, 'page2 workflow', 'comment', approverGroups);

      // then
      await expect(result).rejects.toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
    });

    test('Fails when attempting to set the creator as an approver', async() => {

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
      ];

      // when
      const result = crowi.workflowService.createWorkflow(creator, page2, 'page2 workflow', 'comment', approverGroups);

      // then
      await expect(result).rejects.toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
    });


    test('Fail when setting approver.status to anything other than "NONE" during Workflow creation', async() => {

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
      ];

      // when
      const result = crowi.workflowService.createWorkflow(creator, page2, 'page2 workflow', 'comment', approverGroups);

      // then
      await expect(result).rejects.toThrow('Cannot set approver.status to anything other than "NONE" during creation');
    });
  });
});
