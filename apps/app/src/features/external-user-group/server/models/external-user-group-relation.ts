import { Schema, Model, Document } from 'mongoose';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import UserGroupRelation from '~/server/models/user-group-relation';

import { getOrCreateModel } from '../../../../server/util/mongoose-utils';
import { IExternalUserGroupRelation } from '../../interfaces/external-user-group';

import { ExternalUserGroupDocument } from './external-user-group';

export interface ExternalUserGroupRelationDocument extends IExternalUserGroupRelation, Document {}

export interface ExternalUserGroupRelationModel extends Model<ExternalUserGroupRelationDocument> {
  [x:string]: any, // for old methods

  PAGE_ITEMS: 50,

  removeAllByUserGroups: (groupsToDelete: ExternalUserGroupDocument[]) => Promise<any>,

  findAllUserIdsForUserGroups: (userGroupIds: ObjectIdLike[]) => Promise<string[]>,

  findGroupsWithDescendantsByGroupAndUser: (group: ExternalUserGroupDocument, user) => Promise<ExternalUserGroupDocument[]>,

  countByGroupIdAndUser: (userGroupId: string, userData) => Promise<number>
}

const schema = new Schema<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>({
  relatedGroup: { type: Schema.Types.ObjectId, ref: 'ExternalUserGroup', required: true },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

schema.statics.createRelations = UserGroupRelation.createRelations;

schema.statics.removeAllByUserGroups = UserGroupRelation.removeAllByUserGroups;

schema.statics.findAllRelation = UserGroupRelation.findAllRelation;

schema.statics.removeAllInvalidRelations = UserGroupRelation.removeAllInvalidRelations;

schema.statics.findGroupsWithDescendantsByGroupAndUser = UserGroupRelation.findGroupsWithDescendantsByGroupAndUser;

schema.statics.countByGroupIdAndUser = UserGroupRelation.countByGroupIdAndUser;

schema.statics.findAllUserIdsForUserGroups = UserGroupRelation.findAllUserIdsForUserGroups;

export default getOrCreateModel<ExternalUserGroupRelationDocument, ExternalUserGroupRelationModel>('ExternalUserGroupRelation', schema);
