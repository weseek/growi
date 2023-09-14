import mongoose from 'mongoose';

import { WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType } from '~/features/approval-workflow/interfaces/workflow';

import Workflow from './workflow';


describe('Workflow', () => {

  describe('hasInprogressWorkflowInTargetPage()', () => {
    const page1 = new mongoose.Types.ObjectId();
    const page2 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await Workflow.create({
        creator: new mongoose.Types.ObjectId(),
        pageId: page1,
        name: 'page1 Workflow',
        comment: 'commnet',
        status: WorkflowStatus.INPROGRESS,
        approverGroups: [
          {
            approvalType: WorkflowApprovalType.AND,
            approvers: [
              {
                user: new mongoose.Types.ObjectId(),
                status: WorkflowApproverStatus.NONE,
              },
            ],
          },
        ],
      });
    });

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should return true if there are in-progress workflows on the page', async() => {
      // when
      const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(page1);

      // then
      expect(hasInprogressWorkflowInTargetPage).toBe(true);
    });

    it('Should return false if there are no in-progress workflows on the page', async() => {
      // when
      const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(page2);

      // then
      expect(hasInprogressWorkflowInTargetPage).toBe(false);
    });
  });
});
