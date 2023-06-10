import { Schema, Model, Document } from 'mongoose';

import { IExternalUserGroup } from '~/interfaces/external-user-group';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ExternalUserGroupDocument extends IExternalUserGroup, Document {}

export type ExternalUserGroupModel = Model<ExternalUserGroupDocument>

const schema = new Schema<ExternalUserGroupDocument, ExternalUserGroupModel>({
  name: { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', index: true },
  description: { type: String, default: '' },
  externalID: { type: String, default: '' },
}, {
  timestamps: true,
});

export default getOrCreateModel<ExternalUserGroupDocument, ExternalUserGroupModel>('ExternalUserGroup', schema);
