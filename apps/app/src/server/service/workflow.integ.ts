import mongoose from 'mongoose';

import {
  IWorkflowReq, WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
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

  afterAll(async() => {
    await Workflow.deleteMany({});
  });

  describe('.createWorkflow', () => {
    test('Should be able to create a workflow', async() => {

      // setup
      const workflow: IWorkflowReq = {
        creator,
        pageId: page1,
        status: WorkflowStatus.INPROGRESS,
        name: 'page1 workflow',
        comment: 'comment',
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver1,
                status:  WorkflowApproverStatus.NONE,
              },
              {
                user: approver2,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      };

      // when
      const createdWorkflow = await WorkflowService.createWorkflow(workflow);

      // then
      expect(createdWorkflow).toBeInstanceOf(Workflow);
    });

    test('Should fail when attempting to create multiple in-progress workflows on single page', async() => {

      // setup
      const workflow: IWorkflowReq = {
        creator,
        pageId: page1,
        status: WorkflowStatus.INPROGRESS,
        name: 'page1 workflow',
        comment: 'comment',
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: approver1,
                status:  WorkflowApproverStatus.NONE,
              },
              {
                user: approver2,
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      };

      // when
      const result = WorkflowService.createWorkflow(workflow);

      // then
      await expect(result).rejects.toThrow('An in-progress workflow already exists');
    });
  });
});
