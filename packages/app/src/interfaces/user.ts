import { Ref } from './common';

export type IUser = {
  name: string;
  username: string;
  imageUrlCached: string;
  admin: boolean;
}

export type IUserGroupRelation = {
  relatedGroup: IUserGroup,
  relatedUser: IUser,
  createdAt: Date,
}

export type IUserGroup = {
  _id: string;
  name: string;
  createdAt: Date;
  description: string;
  parent: Ref<IUserGroup>;
}
