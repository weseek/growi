import mongoose from 'mongoose';

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
        name: 'Workflow Approver',
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
      };
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
      const serializedWorkflow = serializeWorkflowSecurely(workflow) as any;

      // then
      expect(mocks.serializeUserSecurelyMock).toBeCalledTimes(4);
      expect(serializedWorkflow.creator?.password).toBeUndefined();
      expect(serializedWorkflow.creator?.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[1].approvers[0].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[1].approvers[0].user.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[1].approvers[1].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[1].approvers[1].user.apiToken).toBeUndefined();
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
      const serializedWorkflow = serializeWorkflowSecurely(workflow, true) as any;

      // then
      expect(mocks.serializeUserSecurelyMock).toBeCalledTimes(1);
      expect(serializedWorkflow.creator.password).toBeUndefined();
      expect(serializedWorkflow.creator.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);
      expect(serializedWorkflow.approverGroups[1].approvers[0].user.password).toEqual(password);
      expect(serializedWorkflow.approverGroups[1].approvers[0].user.apiToken).toEqual(apiToken);
      expect(serializedWorkflow.approverGroups[1].approvers[1].user.password).toEqual(password);
      expect(serializedWorkflow.approverGroups[1].approvers[1].user.apiToken).toEqual(apiToken);
    });
  });
});
