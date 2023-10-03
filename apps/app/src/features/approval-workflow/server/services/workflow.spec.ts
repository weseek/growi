import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus, IWorkflowApproverGroupReq,
} from '../../interfaces/workflow';

import { WorkflowService } from './workflow';


describe('WorkflowService', () => {

  describe('.validateApproverGroups', () => {
    const creator = new mongoose.Types.ObjectId().toString();
    const approver = new mongoose.Types.ObjectId().toString();

    it('Should fail when setting approverGroup.approveType to "OR" when approverGroup.approvers.length is 1', () => {

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
      const caller = () => WorkflowService.validateApproverGroups(true, creator, approverGroups);

      // then
      expect(caller).toThrow('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
    });

    it('Should fail when attempting to set a user as an approver who is already an approver', () => {

      // setup
      const approverGroups = [
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

    it('Should fail when attempting to set the workflow creator as an approver', () => {

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

    it('Should fail when setting approver.status to anything other than "NONE" during workflow creation', () => {

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

  describe('.validateOperatableUser', () => {
    const creatorId = new mongoose.Types.ObjectId().toString();
    const approverId = new mongoose.Types.ObjectId().toString();

    const workflow = {
      _id: new mongoose.Types.ObjectId().toString(),
      creator: creatorId,
      pageId: new mongoose.Types.ObjectId().toString(),
      name: 'test workflow',
      comment: 'test comment',
      status: WorkflowStatus.INPROGRESS,
      approverGroups: [
        {
          isApproved: false,
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: approverId,
              status: WorkflowApproverStatus.NONE,
            },
          ],
        },
      ],
    } as any as IWorkflowHasId;

    it('Should fail if not Workflow Creator, Workflow Approver, or Admin User', () => {
      // setup
      const operator = { _id: new mongoose.Types.ObjectId().toString() } as IUserHasId;

      // when
      const caller = () => WorkflowService.validateOperatableUser(workflow, operator);

      // then
      expect(caller).toThrow('Only the workflow creator, workflow approver or administrator can operate it');
    });

    it('Should not fail if Operator is a Workflow Creator', () => {
      // setup
      const operator = { _id: creatorId } as IUserHasId;

      // when
      const result = WorkflowService.validateOperatableUser(workflow, operator);

      // then
      expect(result).toBeFalsy();
    });

    it('Should not fail if Operator is a Workflow Approver', () => {
      // setup
      const operator = { _id: approverId } as IUserHasId;

      // when
      const result = WorkflowService.validateOperatableUser(workflow, operator);

      // then
      expect(result).toBeFalsy();
    });

    it('Should not fail if Operator is an Admin User', () => {
      // setup
      const operator = {
        _id: new mongoose.Types.ObjectId().toString(),
        admin: true,
      } as IUserHasId;

      // when
      const result = WorkflowService.validateOperatableUser(workflow, operator);

      // then
      expect(result).toBeFalsy();
    });
  });
});
