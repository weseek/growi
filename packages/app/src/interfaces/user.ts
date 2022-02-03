import { Ref } from './common';
import { HasObjectId } from './has-object-id';

export type IUser = {
  name: string;
  username: string;
  email: string;
  password: string;
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
  parent: Ref<IUserGroup> | null;
}

export type IUserHasId = IUser & HasObjectId;
export type IUserGroupHasId = IUserGroup & HasObjectId;
export type IUserGroupRelationHasId = IUserGroupRelation & HasObjectId;
