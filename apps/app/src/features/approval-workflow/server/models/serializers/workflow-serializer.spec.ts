import { isPopulated } from '@growi/core';
import mongoose from 'mongoose';

import type { IWorkflowHasId } from '../../../interfaces/workflow';
import { WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus } from '../../../interfaces/workflow';

import { serializeWorkflowSecurely } from './workflow-serializer';


describe('workflow-seroalizer', () => {

  describe('.serializeWorkflowSecurely', async() => {

    const password = 'password';
    const apiToken = 'bX8XYssHo2L2v2SdWFvTb2zCTMpwGHnhZRf+fMKrfec=';

    let workflow;

    beforeEach(() => {
      const creator = {
        username: 'workflow-creator',
        password,
        apiToken,
      };

      const approver = {
        username: 'Workflow Approver',
        password,
        apiToken,
      };

      workflow = {
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
          {
            isApproved: false,
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver,
                status: WorkflowApproverStatus.NONE,
              },
              {
                user: approver,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      } as IWorkflowHasId;
    });

    const mocks = vi.hoisted(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        serializeUserSecurelyMock: vi.fn((user: any) => { return {} }),
      };
    });

    vi.mock('~/server/models/serializers/user-serializer', () => {
      return { serializeUserSecurely: mocks.serializeUserSecurelyMock };
    });

    mocks.serializeUserSecurelyMock.mockImplementation((user: any) => {
      delete user.password;
      delete user.apiToken;

      return user;
    });

    it('Should serialize creator and approver', () => {
      expect(workflow.creator.password).toEqual(password);
      expect(workflow.creator.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[1].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[1].approvers[0].user.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[1].approvers[1].user.password).toEqual(password);
      expect(workflow.approverGroups[1].approvers[1].user.apiToken).toEqual(apiToken);

      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow);

      // then
      const workflowCreator = serializedWorkflow.creator;
      const workflowApprover1 = serializedWorkflow.approverGroups[0].approvers[0].user;
      const workflowApprover2 = serializedWorkflow.approverGroups[1].approvers[0].user;
      const workflowApprover3 = serializedWorkflow.approverGroups[1].approvers[1].user;

      if (!isPopulated(workflowCreator) || !isPopulated(workflowApprover1) || !isPopulated(workflowApprover2) || !isPopulated(workflowApprover3)) {
        throw Error('Not an IUser Object');
      }

      expect(mocks.serializeUserSecurelyMock).toBeCalledTimes(4);
      expect(workflowCreator.password).toBeUndefined();
      expect(workflowCreator.apiToken).toBeUndefined();
      expect(workflowApprover1.password).toBeUndefined();
      expect(workflowApprover1.apiToken).toBeUndefined();
      expect(workflowApprover2.password).toBeUndefined();
      expect(workflowApprover2.apiToken).toBeUndefined();
      expect(workflowApprover3.password).toBeUndefined();
      expect(workflowApprover3.apiToken).toBeUndefined();
    });

    it('Should serialize only the creator', () => {
      // setup
      expect(workflow.creator.password).toEqual(password);
      expect(workflow.creator.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[1].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[1].approvers[0].user.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[1].approvers[1].user.password).toEqual(password);
      expect(workflow.approverGroups[1].approvers[1].user.apiToken).toEqual(apiToken);

      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow, true);

      // then
      const workflowCreator = serializedWorkflow.creator;
      const workflowApprover1 = serializedWorkflow.approverGroups[0].approvers[0].user;
      const workflowApprover2 = serializedWorkflow.approverGroups[1].approvers[0].user;
      const workflowApprover3 = serializedWorkflow.approverGroups[1].approvers[1].user;

      if (!isPopulated(workflowCreator) || !isPopulated(workflowApprover1) || !isPopulated(workflowApprover2) || !isPopulated(workflowApprover3)) {
        throw Error('Not an IUser Object');
      }

      expect(mocks.serializeUserSecurelyMock).toBeCalledTimes(1);
      expect(workflowCreator.password).toBeUndefined();
      expect(workflowCreator.apiToken).toBeUndefined();
      expect(workflowApprover1.password).toEqual(password);
      expect(workflowApprover1.apiToken).toEqual(apiToken);
      expect(workflowApprover2.password).toEqual(password);
      expect(workflowApprover2.apiToken).toEqual(apiToken);
      expect(workflowApprover3.password).toEqual(password);
      expect(workflowApprover3.apiToken).toEqual(apiToken);
    });
  });
});
