import { Schema, Model, Document } from 'mongoose';

import { IExternalUserGroupRelation } from '~/interfaces/external-user-group';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface ExternalUserGroupRelationDocument extends IExternalUserGroupRelation, Document {}

export interface ExternalUserGroupRelationModel extends Model<ExternalUserGroupRelationDocument> {
  [x:string]: any, // for old methods
}

const schema = new Schema<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>({
  relatedGroup: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', required: true },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

schema.statics.findOrCreateRelation = function(userGroup, user) {
  return this.updateOne({
    relatedGroup: { $eq: userGroup.id },
    relatedUser: { $eq: user.id },
  }, {}, { upsert: true });
};

schema.statics.createRelations = async function(userGroupIds, user) {
  const documentsToInsert = userGroupIds.map((groupId) => {
    return {
      relatedGroup: groupId,
      relatedUser: user._id,
    };
  });

  return this.insertMany(documentsToInsert);
};

/**
   * remove all relation for UserGroup
   *
   * @static
   * @param {UserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   * @memberof UserGroupRelation
   */
schema.statics.removeAllByUserGroups = function(groupsToDelete) {
  if (!Array.isArray(groupsToDelete)) {
    throw Error('groupsToDelete must be an array.');
  }

  return this.deleteMany({ relatedGroup: { $in: groupsToDelete } });
};

export default getOrCreateModel<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>('ExternalUserGroupRelation', schema);
