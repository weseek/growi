import { Schema, Model, Document } from 'mongoose';

import { getOrCreateModel } from '../../../../server/util/mongoose-utils';
import { IExternalUserGroupHasId, IExternalUserGroupRelation } from '../../interfaces/external-user-group';

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
   * remove all relation for ExternalUserGroup
   *
   * @static
   * @param {ExternalUserGroup} userGroup related group for remove
   * @returns {Promise<any>}
   */
schema.statics.removeAllByUserGroups = function(groupsToDelete: IExternalUserGroupHasId[]) {
  return this.deleteMany({ relatedGroup: { $in: groupsToDelete } });
};

export default getOrCreateModel<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>('ExternalUserGroupRelation', schema);
