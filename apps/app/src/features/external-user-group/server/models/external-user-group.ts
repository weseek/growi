import { Schema, Model, Document } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { IExternalUserGroup } from '../../interfaces/external-user-group';


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

/**
 * Find group that has specified externalId and update, or create one if it doesn't exist.
 * @param name ExternalUserGroup name
 * @param name ExternalUserGroup description
 * @param name ExternalUserGroup externalId
 * @param name ExternalUserGroup provider
 * @param name ExternalUserGroup parentId
 * @returns ExternalUserGroupDocument[]
 */
schema.statics.findAndUpdateOrCreateGroup = async function(name, description, externalId, provider, parentId) {
  // create without parent
  if (parentId == null) {
    return this.findOneAndUpdate({ externalId }, { name, description, provider }, { upsert: true, new: true });
  }

  // create with parent
  const parent = await this.findOne({ _id: parentId });
  if (parent == null) {
    throw Error('Parent does not exist.');
  }
  return this.findOneAndUpdate({ externalId }, {
    name, description, provider, parent,
  }, { upsert: true, new: true });
};

/**
 * Find all ancestor groups starting from the UserGroup of the initial "group".
 * Set "ancestors" as "[]" if the initial group is unnecessary as result.
 * @param groups ExternalUserGroupDocument
 * @param ancestors ExternalUserGroupDocument[]
 * @returns ExternalUserGroupDocument[]
 */
schema.statics.findGroupsWithAncestorsRecursively = async function(group, ancestors = [group]) {
  if (group == null) {
    return ancestors;
  }

  const parent = await this.findOne({ _id: group.parent });
  if (parent == null) {
    return ancestors;
  }

  ancestors.unshift(parent);

  return this.findGroupsWithAncestorsRecursively(parent, ancestors);
};

export default getOrCreateModel<ExternalUserGroupDocument, ExternalUserGroupModel>('ExternalUserGroup', schema);
