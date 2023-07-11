import { Schema, Model, Document } from 'mongoose';

import UserGroupRelation from '~/server/models/user-group-relation';

import { getOrCreateModel } from '../../../../server/util/mongoose-utils';
import { IExternalUserGroupRelation } from '../../interfaces/external-user-group';

import { ExternalUserGroupDocument } from './external-user-group';

export interface ExternalUserGroupRelationDocument extends IExternalUserGroupRelation, Document {}

export interface ExternalUserGroupRelationModel extends Model<ExternalUserGroupRelationDocument> {
  [x:string]: any, // for old methods

  PAGE_ITEMS: 50,

  removeAllByUserGroups: (groupsToDelete: ExternalUserGroupDocument[]) => Promise<any>,
}

const schema = new Schema<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>({
  relatedGroup: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', required: true },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

schema.statics.createRelations = UserGroupRelation.createRelations;

schema.statics.removeAllByUserGroups = UserGroupRelation.removeAllByUserGroups;

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
