import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../../interfaces/workflow';


import { serializeWorkflowSecurely } from './workflow-seroalizer';


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
        ],
      } as IWorkflowHasId;
    });

    const mocks = vi.hoisted(() => {
      return {
        serializeUserSecurelyMock: vi.fn(() => { return {} }),
      };
    });

    vi.mock('~/server/models/serializers/user-serializer', () => {
      return { serializeUserSecurely: mocks.serializeUserSecurelyMock };
    });

    it('Should serialize creator and approver', () => {
      // setup
      mocks.serializeUserSecurelyMock.mockImplementationOnce(() => {
        delete workflow.creator.password;
        delete workflow.creator.apiToken;

        return workflow;
      });

      mocks.serializeUserSecurelyMock.mockImplementationOnce(() => {
        delete workflow.approverGroups[0].approvers[0].user.password;
        delete workflow.approverGroups[0].approvers[0].user.apiToken;

        return workflow;
      });

      expect(workflow.creator.password).toEqual(password);
      expect(workflow.creator.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);

      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow);

      // then
      expect(serializedWorkflow.creator.password).toBeUndefined();
      expect(serializedWorkflow.creator.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toBeUndefined();
    });

    it('Should serialize only the creator', () => {
      // setup
      mocks.serializeUserSecurelyMock.mockImplementationOnce(() => {
        delete workflow.creator.password;
        delete workflow.creator.apiToken;

        return workflow;
      });

      expect(workflow.creator.password).toEqual(password);
      expect(workflow.creator.apiToken).toEqual(apiToken);
      expect(workflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(workflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);


      // when
      const serializedWorkflow = serializeWorkflowSecurely(workflow, true);

      // then
      expect(serializedWorkflow.creator.password).toBeUndefined();
      expect(serializedWorkflow.creator.apiToken).toBeUndefined();
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.password).toEqual(password);
      expect(serializedWorkflow.approverGroups[0].approvers[0].user.apiToken).toEqual(apiToken);
    });
  });
});
