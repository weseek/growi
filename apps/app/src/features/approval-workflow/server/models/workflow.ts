import { Model, Schema, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import {
  WorkflowStatus,
  WorkflowStatuses,
  WorkflowApproverStatus,
  WorkflowApproverStatuses,
  WorkflowApprovalType,
  WorkflowApprovalTypes,
} from '../../interfaces/workflow';
import type {
  IWorkflowHasId, IWorkflowApproverGroupHasId, IWorkflowApproverHasId,
} from '../../interfaces/workflow';


/*
* WorkflowApprover
*/
interface WorkflowApproverDocument extends IWorkflowApproverHasId, Document {}
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
interface WorkflowApproverGroupDocument extends IWorkflowApproverGroupHasId, Document {
  findApprover(userId: string): IWorkflowApproverHasId | undefined
}
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

const getApproverStatuses = (approvers: IWorkflowApproverHasId[]) => {
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

WorkflowApproverGroupSchema.methods.findApprover = function(userId: string): IWorkflowApproverHasId | undefined {
  return (this as IWorkflowApproverGroupHasId).approvers.find(v => v.user.toString() === userId);
};


/*
* Workflow
*/
interface WorkflowDocument extends IWorkflowHasId, Document {
  getLatestApprovedApproverGroupIndex(): number | null
  findApproverGroup(groupId: string): IWorkflowApproverGroupHasId | undefined
}
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

WorkflowSchema.methods.getLatestApprovedApproverGroupIndex = function(): number | null {
  const workflow = this as IWorkflowHasId;
  const apprverGroupsLength = workflow.approverGroups.length;
  const reversedApporverGroups = [...workflow.approverGroups].reverse();

  for (let i = 0; i < apprverGroupsLength; i++) {
    if (reversedApporverGroups[i].isApproved) {
      return apprverGroupsLength - i - 1;
    }
  }

  return null;
};

WorkflowSchema.methods.findApproverGroup = function(groupId: string): IWorkflowApproverGroupHasId | undefined {
  return (this as IWorkflowHasId).approverGroups.find(v => v._id.toString() === groupId);
};

export default getOrCreateModel<WorkflowDocument, WorkflowModel>('Workflow', WorkflowSchema);
