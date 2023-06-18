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
  provider: { type: String, required: true },
}, {
  timestamps: true,
});

schema.statics.findAndUpdateOrCreateGroup = async function(name, description, externalId, provider, parentId) {
  // create without parent
  if (parentId == null) {
    return this.findOneAndUpdate({ name }, { description, externalId, provider }, { upsert: true });
  }

  // create with parent
  const parent = await this.findOne({ _id: parentId });
  if (parent == null) {
    throw Error('Parent does not exist.');
  }
  return this.findOneAndUpdate({ name }, {
    description, externalId, provider, parent,
  }, { upsert: true });
};

export default getOrCreateModel<ExternalUserGroupDocument, ExternalUserGroupModel>('ExternalUserGroup', schema);
