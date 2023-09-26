import mongoose from 'mongoose';

import { WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType } from '../../interfaces/workflow';

import Workflow from './workflow';


describe('Workflow', () => {

  describe('.hasInprogressWorkflowInTargetPage', () => {
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

  describe('.isLastApprover', () => {
    const targetApprover = new mongoose.Types.ObjectId();
    const targetWorkflow1 = new mongoose.Types.ObjectId();
    const targetWorkflow2 = new mongoose.Types.ObjectId();
    const targetWorkflow3 = new mongoose.Types.ObjectId();
    const targetWorkflow4 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await Workflow.insertMany([
        {
          _id: targetWorkflow1,
          creator: new mongoose.Types.ObjectId(),
          pageId:  new mongoose.Types.ObjectId().toString(),
          name: 'test workflow',
          comment: 'commnet',
          status: WorkflowStatus.APPROVE,
          approverGroups: [
            {
              approvalType: WorkflowApprovalType.OR,
              approvers: [
                {
                  user: targetApprover,
                  status: WorkflowApproverStatus.APPROVE,
                },
              ],
            },
          ],
        },
        {
          _id: targetWorkflow2,
          creator: new mongoose.Types.ObjectId(),
          pageId:  new mongoose.Types.ObjectId().toString(),
          name: 'test workflow',
          comment: 'commnet',
          status: WorkflowStatus.INPROGRESS,
          approverGroups: [
            {
              approvalType: WorkflowApprovalType.AND,
              approvers: [
                {
                  user: targetApprover,
                  status: WorkflowApproverStatus.NONE,
                },
              ],
            },
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
        {
          _id: targetWorkflow3,
          creator: new mongoose.Types.ObjectId(),
          pageId:  new mongoose.Types.ObjectId().toString(),
          name: 'test workflow',
          comment: 'commnet',
          status: WorkflowStatus.INPROGRESS,
          approverGroups: [
            {
              approvalType: WorkflowApprovalType.OR,
              approvers: [
                {
                  user: targetApprover,
                  status: WorkflowApproverStatus.NONE,
                },
                {
                  user: new mongoose.Types.ObjectId(),
                  status: WorkflowApproverStatus.NONE,
                },
              ],
            },
          ],
        },
        {
          _id: targetWorkflow4,
          creator: new mongoose.Types.ObjectId(),
          pageId:  new mongoose.Types.ObjectId().toString(),
          name: 'test workflow',
          comment: 'commnet',
          status: WorkflowStatus.INPROGRESS,
          approverGroups: [
            {
              approvalType: WorkflowApprovalType.OR,
              approvers: [
                {
                  user: targetApprover,
                  status: WorkflowApproverStatus.NONE,
                },
                {
                  user: new mongoose.Types.ObjectId(),
                  status: WorkflowApproverStatus.NONE,
                },
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

    it('Should return "false" if approveGroup.isApproved is "true"', async() => {
      // setup
      const workflow = await Workflow.findById(targetWorkflow1);

      // when
      const isLastApprover = workflow?.isLastApprover(targetApprover.toString());

      // then
      expect(isLastApprover).toBe(false);
    });

    it('Should return "false" when the approver does not belong to the last approverGroup', async() => {
      // setup
      const workflow = await Workflow.findById(targetWorkflow2);

      // when
      const isLastApprover = workflow?.isLastApprover(targetApprover.toString());

      // then
      expect(isLastApprover).toBe(false);
    });

    // eslint-disable-next-line max-len
    it('Should return "true" when the approver belongs to the last approverGroup, approverGroup.isApproved is "false" and WorkflowApprovalType is "OR"', async() => {
      // setup
      const workflow = await Workflow.findById(targetWorkflow3);

      // when
      const isLastApprover = workflow?.isLastApprover(targetApprover.toString());

      // then
      expect(isLastApprover).toBe(true);
    });

    // eslint-disable-next-line max-len
    it('Should return "true" when the approver belongs to the last approverGroup, and the last one among the approvers in the approverGroup', async() => {
      // setup
      const workflow = await Workflow.findById(targetWorkflow4);

      // when
      const isLastApprover = workflow?.isLastApprover(targetApprover.toString());

      // then
      expect(isLastApprover).toBe(true);
    });
  });
});
