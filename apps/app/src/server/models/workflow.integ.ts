import mongoose from 'mongoose';

import { WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType } from '~/interfaces/workflow';

import Workflow from './workflow';

let page1;
let page2;

describe('Workflow', () => {

  beforeAll(async() => {
    page1 = new mongoose.Types.ObjectId();
    page2 = new mongoose.Types.ObjectId();

    await Workflow.insertMany([
      {
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
      },
    ]);
  });

  describe('hasInprogressWorkflowInTargetPage()', () => {
    test('Should return true if there are in-progress workflows on the page」', async() => {
      // when
      const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(page1);

      // then
      expect(hasInprogressWorkflowInTargetPage).toBe(true);
    });

    test('Should return false if there are no in-progress workflows on the page', async() => {
      // when
      const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(page2);

      // then
      expect(hasInprogressWorkflowInTargetPage).toBe(false);
    });
  });
});
