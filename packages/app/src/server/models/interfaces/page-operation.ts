import { ObjectIdLike } from '../../interfaces/mongoose-utils';

export type IPageForResuming = {
  _id: ObjectIdLike,
  path: string,
  isEmpty: boolean,
  parent?: ObjectIdLike,
  grant?: number,
  grantedUsers?: ObjectIdLike[],
  grantedGroup?: ObjectIdLike,
  descendantCount: number,
  status?: number,
  revision?: ObjectIdLike,
  lastUpdateUser?: ObjectIdLike,
  creator?: ObjectIdLike,
};

export type IUserForResuming = {
  _id: ObjectIdLike,
};

export type IOptionsForResuming = {
  updateMetadata?: boolean,
  createRedirectPage?: boolean,
  prevDescendantCount?: number,
};
