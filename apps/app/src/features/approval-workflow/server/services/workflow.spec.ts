import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../interfaces/workflow';

import { WorkflowService } from './workflow';


describe('WorkflowService', () => {

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
