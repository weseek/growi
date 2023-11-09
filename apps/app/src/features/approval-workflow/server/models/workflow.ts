import type { IUser, Ref } from '@growi/core';
import {
  Model, Schema, Types, Document,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import { getOrCreateModel } from '~/server/util/mongoose-utils';

import {
  type IWorkflowApproverGroupReq,
  WorkflowStatus,
  WorkflowStatuses,
  WorkflowApproverStatus,
  WorkflowApproverStatuses,
  WorkflowApprovalType,
  WorkflowApprovalTypes,
} from '../../interfaces/workflow';


/*
* WorkflowApprover
*/
interface IWorkflowApproverDocument {
  user: Ref<IUser>
  status: WorkflowApproverStatus
}

export interface WorkflowApproverDocument extends IWorkflowApproverDocument, Document {}
type WorkflowApproverModel = Model<WorkflowApproverDocument>;

const WorkflowApproverSchema = new Schema<WorkflowApproverDocument, WorkflowApproverModel>({
  user: {
    type: Schema.Types.ObjectId,
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
export interface IWorkflowApproverGroupDocument {
  approvalType: WorkflowApprovalType
  approvers: Types.DocumentArray<WorkflowApproverDocument>
  isApproved: boolean
}
export interface WorkflowApproverGroupDocument extends IWorkflowApproverGroupDocument, Document {
  findApprover(userId: string): WorkflowApproverDocument | undefined

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

const getApproverStatuses = (approvers: Types.DocumentArray<WorkflowApproverDocument>) => {
  return approvers.map((approver: WorkflowApproverDocument) => approver.status);
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

WorkflowApproverGroupSchema.methods.findApprover = function(userId: string): WorkflowApproverDocument | undefined {
  return (this as WorkflowApproverGroupDocument).approvers.find(v => v.user.toString() === userId);
};


/*
* Workflow
*/

// Rewrote the interface of the splice method to add new data to the ApproverGroups array, since it must be in the form of a "WorkflowApproverGroupDocument"
type WorkflowApproverGroupDocumentWithoutArraySplice = Omit<
  Types.DocumentArray<WorkflowApproverGroupDocument
>, 'splice'> & { splice: (start: number, deleteCount: number, item: IWorkflowApproverGroupReq) => void }

export type IWorkflowDocument = {
  creator: Ref<IUser>
  pageId: string
  name?: string,
  comment?: string,
  status: WorkflowStatus,
  approverGroups: WorkflowApproverGroupDocumentWithoutArraySplice
};
export interface WorkflowDocument extends IWorkflowDocument, Document {
  getLatestApprovedApproverGroupIndex(): number | null
}
interface WorkflowModel extends Model<WorkflowDocument> {
  hasInprogressWorkflowInTargetPage(pageId: ObjectIdLike): Promise<boolean>
}

const WorkflowSchema = new Schema<WorkflowDocument, WorkflowModel>({
  creator: {
    type: Schema.Types.ObjectId,
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
  const workflow = this as WorkflowDocument;
  const apprverGroupsLength = workflow.approverGroups.length;

  for (let i = apprverGroupsLength; i > 0; i--) {
    const groupIndex = i - 1;
    if (workflow.approverGroups[groupIndex].isApproved) {
      return groupIndex;
    }
  }

  return null;
};

export default getOrCreateModel<WorkflowDocument, WorkflowModel>('Workflow', WorkflowSchema);
