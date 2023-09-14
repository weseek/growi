import { Model, Schema, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import type {
  IWorkflow, IWorkflowApproverGroup, IWorkflowApprover,
} from '~/interfaces/workflow';
import {
  WorkflowStatus,
  WorkflowStatuses,
  WorkflowApproverStatus,
  WorkflowApproverStatuses,
  WorkflowApprovalType,
  WorkflowApprovalTypes,
} from '~/interfaces/workflow';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import { getOrCreateModel } from '../util/mongoose-utils';


/*
* WorkflowApprover
*/
interface WorkflowApproverDocument extends IWorkflowApprover, Document {}
type WorkflowApproverModel = Model<WorkflowApproverDocument>;

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
}, {
  timestamps: { createdAt: true, updatedAt: true },
});


/*
* WorkflowApproverGroup
*/
interface WorkflowApproverGroupDocument extends IWorkflowApproverGroup, Document {}
type WorkflowApproverGroupModel = Model<WorkflowApproverGroupDocument>

const WorkflowApproverGroupSchema = new Schema<WorkflowApproverGroupDocument, WorkflowApproverGroupModel>({
  approvalType: {
    type: Schema.Types.String,
    enum: WorkflowApprovalTypes,
    default: WorkflowApprovalType.AND,
    required: true,
  },
  approvers: [WorkflowApproverSchema],
}, {
  timestamps: { createdAt: true, updatedAt: true },
});

const getApproverStatuses = (approvers: IWorkflowApprover[]) => {
  return approvers.map(approver => approver.status);
};

WorkflowApproverGroupSchema.virtual('isApproved').get(function() {
  if (this.approvers.length === 0) {
    return false;
  }

  if (this.approvalType === WorkflowApprovalType.AND) {
    const statuses = getApproverStatuses(this.approvers);
    return statuses.every(status => status === WorkflowApproverStatus.APPROVE);
  }

  if (this.approvalType === WorkflowApprovalType.OR) {
    const statuses = getApproverStatuses(this.approvers);
    return statuses.some(status => status === WorkflowApproverStatus.APPROVE);
  }
});

WorkflowApproverGroupSchema.set('toJSON', { virtuals: true });
WorkflowApproverGroupSchema.set('toObject', { virtuals: true });


/*
* Workflow
*/
interface WorkflowDocument extends IWorkflow, Document {}
interface WorkflowModel extends Model<WorkflowDocument> {
  hasInprogressWorkflowInTargetPage(pageId: ObjectIdLike): Promise<boolean>
}

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
  },
  comment: {
    type: Schema.Types.String,
  },
  status: {
    type: Schema.Types.String,
    enum: WorkflowStatuses,
    required: true,
  },
  // TODO: https://redmine.weseek.co.jp/issues/130039
  approverGroups: [WorkflowApproverGroupSchema],
}, {
  timestamps: { createdAt: true, updatedAt: true },
});

WorkflowSchema.plugin(mongoosePaginate);

WorkflowSchema.statics.hasInprogressWorkflowInTargetPage = async function(pageId: ObjectIdLike) {
  const workflow = await this.exists({ pageId, status: WorkflowStatus.INPROGRESS });
  return workflow != null;
};

export default getOrCreateModel<WorkflowDocument, WorkflowModel>('Workflow', WorkflowSchema);
