import { Schema, Model, Document } from 'mongoose';

import { getOrCreateModel } from '../../../../server/util/mongoose-utils';
import { IExternalUserGroupRelation } from '../../interfaces/external-user-group';


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
 * find all user and group relation
 */
schema.statics.findAllRelation = async function() {
  return this
    .find()
    .populate('relatedUser')
    .populate('relatedGroup')
    .exec();
};

/**
 * remove all invalid relations that has reference to unlinked document
 */
schema.statics.removeAllInvalidRelations = async function() {
  return this.findAllRelation()
    .then((relations) => {
      // filter invalid documents
      return relations.filter((relation) => {
        return relation.relatedUser == null || relation.relatedGroup == null;
      });
    })
    .then((invalidRelations) => {
      const ids = invalidRelations.map((relation) => { return relation._id });
      return this.deleteMany({ _id: { $in: ids } });
    });
};

export default getOrCreateModel<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>('ExternalUserGroupRelation', schema);
