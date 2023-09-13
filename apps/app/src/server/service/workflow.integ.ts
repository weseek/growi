import mongoose from 'mongoose';

import {
  IWorkflowReq, WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
} from '~/interfaces/workflow';
import Workflow from '~/server/models/workflow';

import { WorkflowService } from './workflow';


describe('WorkflowService', () => {

  describe('.createWorkflow', () => {
    const workflow: IWorkflowReq = {
      creator: new mongoose.Types.ObjectId(),
      pageId: new mongoose.Types.ObjectId().toString(),
      status: WorkflowStatus.INPROGRESS,
      name: 'page1 workflow',
      comment: 'comment',
      approverGroups: [
        {
          approvalType: WorkflowApprovalType.AND,
          approvers: [
            {
              user: new mongoose.Types.ObjectId(),
              status:  WorkflowApproverStatus.NONE,
            },
          ],
        },
      ],
    };

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should be able to create a workflow', async() => {
      // when
      const createdWorkflow = await WorkflowService.createWorkflow(workflow);

      // then
      expect(createdWorkflow).toBeInstanceOf(Workflow);
    });

    it('Should fail when attempting to create multiple in-progress workflows on single page', async() => {
      // when
      const result = WorkflowService.createWorkflow(workflow);

      // then
      await expect(result).rejects.toThrow('An in-progress workflow already exists');
    });
  });
});
