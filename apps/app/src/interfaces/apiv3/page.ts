import type {
  IGrantedGroup, IPageHasId, IRevisionHasId, ITag, PageGrant,
} from '@growi/core';

export type IApiv3PageCreateParams = {
  path?: string,
  parentPath?: string,
  optionalParentPath?: string,

  body?: string,
  pageTags?: string[],

  grant?: PageGrant,
  grantUserGroupIds?: IGrantedGroup[],
  overwriteScopesOfDescendants?: boolean,

  isSlackEnabled?: boolean,
  slackChannels?: string,
};

export type IApiv3PageCreateResponse = {
  page: IPageHasId,
  tags: ITag[],
  revision: IRevisionHasId,
};

export type IApiv3PageUpdateParams = {
  pageId: string,
  revisionId: string,
  body: string,

  grant?: PageGrant,
  userRelatedGrantUserGroupIds?: IGrantedGroup[],
  overwriteScopesOfDescendants?: boolean,

  isSlackEnabled?: boolean,
  slackChannels?: string,
};

export type IApiv3PageUpdateResponse = {
  page: IPageHasId,
  revision: IRevisionHasId,
};
