import mongoose from 'mongoose';

import { WorkflowApprovalType, IWorkflowApproverGroupReq } from '~/interfaces/workflow';

import { WorkflowService } from './workflow';


let creator;
let approver;

describe('WorkflowService', () => {

  beforeAll(async() => {
    // user
    creator = new mongoose.Types.ObjectId();
    approver = new mongoose.Types.ObjectId();
  });

  describe('.validateApproverGroups', () => {
    test('Should fail when setting approverGroup.approveType to "OR" when approverGroup.approvers.length is 1', () => {

      // setup
      const approverGroups: IWorkflowApproverGroupReq[] = [
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
      const caller = () => WorkflowService.validateApproverGroups(true, creator, approverGroups);

      // then
      expect(caller).toThrow('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
    });

    test('Should fail when attempting to set a user as an approver who is already an approver', () => {

      // setup
      const approverGroups: IWorkflowApproverGroupReq[] = [
        {
          approvalType: WorkflowApprovalType.OR,
          approvers: [
            {
              user: approver,
            },
            {
              user: approver,
            },
          ],
        },
      ];

      // when
      const caller = () => WorkflowService.validateApproverGroups(true, creator, approverGroups);

      // then
      expect(caller).toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
    });

    test('Should fail when attempting to set the workflow creator as an approver', () => {

      // setup
      const approverGroups: IWorkflowApproverGroupReq[] = [
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
      const caller = () => WorkflowService.validateApproverGroups(true, creator, approverGroups);

      // then
      expect(caller).toThrow('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
    });

    test('Should fail when setting approver.status to anything other than "NONE" during workflow creation', () => {

      // setup
      const approverGroups: IWorkflowApproverGroupReq[] = [
        {
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: approver,
              status: 'APPROVE',
            },
          ],
        },
      ];

      // when
      const caller = () => WorkflowService.validateApproverGroups(true, creator, approverGroups);

      // then
      expect(caller).toThrow('Cannot set approver.status to anything other than "NONE" during creation');
    });
  });
});
