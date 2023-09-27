import mongoose from 'mongoose';

import {
  IWorkflowHasId, WorkflowStatus, WorkflowApproverStatus, WorkflowApprovalType,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

import { WorkflowService } from './workflow';


describe('WorkflowService', () => {

  describe('.createWorkflow', () => {
    const workflow = {
      creator: new mongoose.Types.ObjectId(),
      pageId: new mongoose.Types.ObjectId(),
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

  describe('.deleteWorkflow', () => {

    // workflow
    const workflowId1 = new mongoose.Types.ObjectId();
    const workflowId2 = new mongoose.Types.ObjectId();

    // user
    const workflowCreatorId = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await Workflow.create({
        _id: workflowId2,
        creator: workflowCreatorId,
        pageId: new mongoose.Types.ObjectId(),
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

    it('Should fail if a non-existent workflowId is provided', async() => {
      // when
      const caller = () => WorkflowService.deleteWorkflow(workflowId1);

      // then
      expect(caller).rejects.toThrow('Target workflow does not exist');
    });

    it('Should allow workflow creator to delete the workflow', async() => {
      // setup
      expect(await Workflow.exists(workflowId2)).not.toBeNull();

      // when
      await WorkflowService.deleteWorkflow(workflowId2);

      // then
      expect(await Workflow.exists(workflowId2)).toBeNull();
    });
  });

  describe('.approve', () => {
    const operator = new mongoose.Types.ObjectId();
    const workflow1 = new mongoose.Types.ObjectId();
    const workflow2 = new mongoose.Types.ObjectId();

    beforeAll(async() => {
      await Workflow.insertMany([
        {
          _id: workflow1,
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
                  user: operator,
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
          _id: workflow2,
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
                  user: operator,
                  status: WorkflowApproverStatus.NONE,
                },
              ],
            },
          ],
        },
      ]);
    });

    afterAll(async() => {
      await Workflow.deleteMany({});
    });

    it('Should keep approver.status as "APPROVE" and workflow.status as "INPROGRESS" if not the final approver', async() => {
      // setup
      const beforeWorkflow = await Workflow.findById(workflow1) as unknown as IWorkflowHasId;
      expect(beforeWorkflow.status).toEqual(WorkflowStatus.INPROGRESS);
      expect(beforeWorkflow.approverGroups[0].approvers[0].status).toEqual(WorkflowApproverStatus.NONE);

      // when
      await WorkflowService.approve(workflow1.toString(), operator.toString());

      // then
      const afterWorkflow = await Workflow.findById(workflow1) as unknown as IWorkflowHasId;
      expect(afterWorkflow.status).toEqual(WorkflowStatus.INPROGRESS);
      expect(afterWorkflow.approverGroups[0].approvers[0].status).toEqual(WorkflowApproverStatus.APPROVE);
    });

    it('Should result in approver.status becoming "APPROVE" and workflow.status changing to "APPROVE" if the User is the final approver', async() => {
      // setup
      const beforeWorkflow = await Workflow.findById(workflow2) as unknown as IWorkflowHasId;
      expect(beforeWorkflow.status).toEqual(WorkflowStatus.INPROGRESS);
      expect(beforeWorkflow.approverGroups[0].approvers[0].status).toEqual(WorkflowApproverStatus.NONE);

      // when
      await WorkflowService.approve(workflow2.toString(), operator.toString());

      // then
      const afterWorkflow = await Workflow.findById(workflow2) as unknown as IWorkflowHasId;
      expect(afterWorkflow.status).toEqual(WorkflowStatus.APPROVE);
      expect(afterWorkflow.approverGroups[0].approvers[0].status).toEqual(WorkflowApproverStatus.APPROVE);
    });
  });
});
