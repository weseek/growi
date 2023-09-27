import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../../interfaces/workflow';

import { serializeWorkflowSecurely } from './workflow-seroalizer';


describe('workflow-seroalizer', () => {

  describe('.serializeWorkflowSecurely', async() => {
    class DummyUser {

      username: string;

      password: string;

      apiToken: string;

      constructor(username: string, password: string, apiToken: string) {
        this.username = username;
        this.password = password;
        this.apiToken = apiToken;
      }

    }

    vi.spyOn(mongoose, 'model').mockReturnValue(DummyUser);

    let workflow;
    const password = 'password';
    const apiToken = 'bX8XYssHo2L2v2SdWFvTb2zCTMpwGHnhZRf+fMKrfec=';

    beforeEach(() => {
      const creator = new DummyUser('workflow-creator', password, apiToken);
      const approver = new DummyUser('workflow-approver', password, apiToken);

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

    it('Should serialize creator and approver', () => {
      // setup
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
