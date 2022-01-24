export type IUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  imageUrlCached: string;
  admin: boolean;
}

export type IUserGroupRelation = {
  relatedGroup: IUserGroup,
  relatedUser: IUser,
  createdAt: Date,
}

export type IUserGroup = {
  userGroupId:string;
  name: string;
  createdAt: Date;
}
