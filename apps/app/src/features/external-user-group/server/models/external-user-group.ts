import { Schema, Model, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IExternalUserGroup } from '~/features/external-user-group/interfaces/external-user-group';
import { getOrCreateModel } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:models:external-user-groups');

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
schema.plugin(mongoosePaginate);

const PAGE_ITEMS = 10;

schema.statics.findWithPagination = function(opts) {
  const query = { parent: null };
  const options = Object.assign({}, opts);
  if (options.page == null) {
    options.page = 1;
  }
  if (options.limit == null) {
    options.limit = PAGE_ITEMS;
  }

  return this.paginate(query, options)
    .catch((err) => {
      logger.error(err);
    });
};

schema.statics.findChildrenByParentIds = async function(parentIds, includeGrandChildren = false) {
  if (!Array.isArray(parentIds)) {
    throw Error('parentIds must be an array.');
  }

  const childUserGroups = await this.find({ parent: { $in: parentIds } });

  let grandChildUserGroups: ExternalUserGroupDocument[] | null = null;
  if (includeGrandChildren) {
    const childExternalUserGroupIds = childUserGroups.map(group => group._id);
    grandChildUserGroups = await this.find({ parent: { $in: childExternalUserGroupIds } });
  }

  return {
    childUserGroups,
    grandChildUserGroups,
  };
};

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

/**
 * TODO: use $graphLookup
 * Find all descendant groups starting from the UserGroups in the initial groups in "groups".
 * Set "descendants" as "[]" if the initial groups are unnecessary as result.
 * @param groups UserGroupDocument[] including at least one UserGroup
 * @param descendants UserGroupDocument[]
 * @returns UserGroupDocument[]
 */
schema.statics.findGroupsWithDescendantsRecursively = async function(groups, descendants = groups) {
  const nextGroups = await this.find({ parent: { $in: groups.map(g => g._id) } });

  if (nextGroups.length === 0) {
    return descendants;
  }

  return this.findGroupsWithDescendantsRecursively(nextGroups, descendants.concat(nextGroups));
};

export default getOrCreateModel<ExternalUserGroupDocument, ExternalUserGroupModel>('ExternalUserGroup', schema);
