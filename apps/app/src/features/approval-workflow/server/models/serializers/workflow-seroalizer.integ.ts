import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../../interfaces/workflow';

import { serializeWorkflowSecurely } from './workflow-seroalizer';


describe('workflow-seroalizer', () => {
  describe('.serializeWorkflowSecurely', async() => {

    const DummyUserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      apiToken: { type: String, required: true },
    });
    const User = mongoose.model('User', DummyUserSchema);

    const creator = new User({
      name: 'Workflow Creator',
      username: 'workflow-creator',
      email: 'workflow-creator@example.com',
      password: 'password',
      apiToken: 'bX8XYssHo2L2v2SdWFvTb2zCTMpwGHnhZRf+fMKrfec=',
    }) as unknown as IUserHasId;

    const approver = new User({
      name: 'Workflow Approver',
      username: 'workflow-approver',
      email: 'workflow-approver@example.com',
      password: 'password',
      apiToken: '3Cq0QJfrStpv74P26asp2lJiefHwO/y+ooWeuoOBuaI=',
    }) as unknown as IUserHasId;

    const workflow = {
      _id: new mongoose.Types.ObjectId().toString(),
      creator,
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
              user: approver,
              status: WorkflowApproverStatus.NONE,
            },
          ],
        },
      ],
    } as IWorkflowHasId;

    it('Should serialize the password and apiToken for creator and approver', () => {
      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow);

      // then
      expect(serializedWorkflow.creator.password).toBeUndefined();
      expect(serializedWorkflow.creator.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toBeUndefined();
    });

    it("Should serialize only the creator's password and apiToken when the second argument of serializeWorkflowSecurely is 'true'", () => {
      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow, true);

      // then
      expect(serializedWorkflow.creator.password).toBeUndefined();
      expect(serializedWorkflow.creator.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toBeUndefined();
    });
  });

});
