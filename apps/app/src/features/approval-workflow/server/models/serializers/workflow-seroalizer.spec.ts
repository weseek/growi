import type { IUserHasId } from '@growi/core';
import mongoose from 'mongoose';
import { mock } from 'vitest-mock-extended';

import { serializeUserGroupRelationSecurely } from '~/server/models/serializers/user-group-relation-serializer';
import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';

import {
  IWorkflowHasId, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../../interfaces/workflow';

import { serializeWorkflowSecurely } from './workflow-seroalizer';


describe('workflow-seroalizer', () => {

  describe('.serializeWorkflowSecurely', async() => {
    const mocks = vi.hoisted(() => {
      return {
        serializeUserSecurelyMock: vi.fn(() => { return {} }),
      };
    });

    vi.mock('~/server/models/serializers/user-serializer', () => {
      return { serializeUserSecurely: mocks.serializeUserSecurelyMock };
    });

    const creator = {
      name: 'Workflow Creator',
      username: 'workflow-creator',
      email: 'workflow-creator@example.com',
    } as unknown as IUserHasId;

    const approver = {
      name: 'Workflow Approver',
      username: 'workflow-approver',
      email: 'workflow-approver@example.com',
    } as unknown as IUserHasId;

    const workflow = {
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

    it('Should execute the dependent serializeUserSecurely when serializeWorkflowSecurely is called', () => {
      // setup
      mocks.serializeUserSecurelyMock.mockImplementation(() => {
        return workflow;
      });

      // when
      serializeWorkflowSecurely(workflow);

      // then
      expect(mocks.serializeUserSecurelyMock).toHaveBeenCalled();
    });
  });

});
