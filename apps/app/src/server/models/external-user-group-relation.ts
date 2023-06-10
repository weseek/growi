import { Schema, Model, Document } from 'mongoose';

import { IExternalUserGroupRelation } from '~/interfaces/external-user-group';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ExternalUserGroupRelationDocument extends IExternalUserGroupRelation, Document {}

export type ExternalUserGroupRelationModel = Model<ExternalUserGroupRelationDocument>

const schema = new Schema<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>({
  relatedGroup: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', required: true },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export default getOrCreateModel<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>('ExternalUserGroupRelation', schema);
