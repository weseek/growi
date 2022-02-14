import { ObjectIdLike } from './mongoose-utils';

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

/*
 * PageService interfaces
 */
export type ResumeRenameArgs = { // (page, newPagePath, user, options, shouldUseV4Process, renamedPage, oldPageParentId)
  page: IPageForResuming, // TODO: improve type
  newPagePath: string,
  user: any, // TODO: improve type
  options: boolean,
  shouldUseV4Process,
  renamedPage,
  oldPageParentId,
};
export type ResumeDuplicateArgs = { // (page, newPagePath, user, shouldUseV4Process, createdPageId)
  page: IPageForResuming,
  newPagePath: any,
  user: any,
  shouldUseV4Process?: boolean,
  createdPageId,
};
export type ResumeDeleteArgs = { // (page, user, shouldUseV4Process)
  page: IPageForResuming,
  user: any,
  shouldUseV4Process?: boolean,
};
export type ResumeDeleteCompletelyArgs = { // (page, user, options, shouldUseV4Process)
  page: IPageForResuming,
  user: any,
  options: any,
  shouldUseV4Process?: boolean,
};
export type ResumeRevertArgs = { // (page, user, options, shouldUseV4Process)
  page: IPageForResuming,
  user: any,
  options: any,
  shouldUseV4Process?: boolean,
};


export type ResumeNormalizeParentArgs = {
  a: any,
};

export type ResumerArgs = ResumeRenameArgs | ResumeDuplicateArgs | ResumeDeleteArgs | ResumeDeleteCompletelyArgs | ResumeRevertArgs | ResumeNormalizeParentArgs;


/*
 * PageOperationService interfaces
 */
