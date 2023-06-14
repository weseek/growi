import { Schema, Model, Document } from 'mongoose';

import { IExternalUserGroup } from '~/interfaces/external-user-group';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ExternalUserGroupDocument extends IExternalUserGroup, Document {}

export interface ExternalUserGroupModel extends Model<ExternalUserGroupDocument> {
  [x:string]: any, // for old methods
}

const schema = new Schema<ExternalUserGroupDocument, ExternalUserGroupModel>({
  name: { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', index: true },
  description: { type: String, default: '' },
  externalId: { type: String, required: true, unique: true },
}, {
  timestamps: true,
});

schema.statics.createGroup = async function(name, description, externalId, parentId) {
  // create without parent
  if (parentId == null) {
    return this.create({ name, description, externalId });
  }

  // create with parent
  const parent = await this.findOne({ _id: parentId });
  if (parent == null) {
    throw Error('Parent does not exist.');
  }
  return this.create({
    name, description, externalId, parent,
  });
};

schema.statics.getByExternalIdOrCreateGroup = async function(name, description, externalId, parentId) {
  return this.createGroup(name, description, externalId, parentId);
};

export default getOrCreateModel<ExternalUserGroupDocument, ExternalUserGroupModel>('ExternalUserGroup', schema);
