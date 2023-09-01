import { Model, Schema, Types } from 'mongoose';

import type { IWorkflow, IWorkflowApproverGroup, IWorkflowApprover } from '~/interfaces/workflow';
import {
  WorkflowStatuses,
  WorkflowApproverStatus,
  WorkflowApproverStatuses,
  WorkflowApprovalType,
  WorkflowApprovalTypes,
} from '~/interfaces/workflow';

import { getOrCreateModel } from '../util/mongoose-utils';

interface WorkflowApproverDocument extends IWorkflowApprover, Document {}
type WorkflowApproverModel = Model<WorkflowApproverDocument>;

interface WorkflowApproverGroupDocument extends IWorkflowApproverGroup, Document {}
type WorkflowApproverGroupModel = Model<WorkflowApproverGroupDocument>

interface WorkflowDocument extends IWorkflow, Document {}
type WorkflowModel = Model<WorkflowDocument>;


const WorkflowApproverSchema = new Schema<WorkflowApproverDocument, WorkflowApproverModel>({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: Schema.Types.String,
    enum: WorkflowApproverStatuses,
    default: WorkflowApproverStatus.NONE,
    required: true,
  },
});


const WorkflowApproverGroupSchema = new Schema<WorkflowApproverGroupDocument, WorkflowApproverGroupModel>({
  approvalType: {
    type: Schema.Types.String,
    enum: WorkflowApprovalTypes,
    default: WorkflowApprovalType.AND,
    required: true,
  },
  approvers: [WorkflowApproverSchema],
});


const WorkflowSchema = new Schema<WorkflowDocument, WorkflowModel>({
  creator: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pageId: {
    type: Schema.Types.String,
    required: true,
  },
  name: {
    type: Schema.Types.String,
    required: true,
  },
  comment: {
    type: Schema.Types.String,
    required: true,
  },
  status: {
    type: Schema.Types.String,
    enum: WorkflowStatuses,
    required: true,
  },
  approverGroups: [WorkflowApproverGroupSchema],
});

export default getOrCreateModel<WorkflowDocument, WorkflowModel>('Workflow', WorkflowSchema);
