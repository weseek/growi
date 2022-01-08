import { Ref } from './common';
import { HasObjectId } from './has-object-id';

export type IUser = {
  name: string;
  username: string;
  imageUrlCached: string;
  admin: boolean;
}

export type IUserGroupRelation = {
  relatedGroup: Ref<IUserGroup>,
  relatedUser: Ref<IUser>,
  createdAt: Date,
}

export type IUserGroup = {
  name: string;
  createdAt: Date;
  description: string;
  parent: Ref<IUserGroup>;
}

export type IUserGroupHasObjectId = IUserGroup & HasObjectId;
