import type { IPageHasId, PageGrant } from '@growi/core';

export type AggregatedPage = Pick<IPageHasId,
  '_id'
  | 'path'
  | 'createdAt'
  | 'updatedAt'
  | 'liker'
  | 'seenUsers'
  | 'grant'
  | 'grantedUsers'
  | 'grantedGroups'
> & {
  revision: { body: string },
  comments: string[],
  commentsCount: number,
  creator: {
    username: string,
    email: string,
  },
} & {
  bookmarkCount: number,
  tagNames: string[],
};

export type BulkWriteCommand = {
  index: {
    _index: string,
    _type: '_doc' | undefined,
    _id: string,
  },
}

export type BulkWriteBodyRestriction = {
  grant: PageGrant,
  granted_users?: string[],
  granted_groups: string[],
}

export type BulkWriteBody = {
  path: string;
  body: string;
  username?: string;
  comment_count: number;
  bookmark_count: number;
  seenUsers_count: number;
  like_count: number;
  created_at: Date;
  updated_at: Date;
  tag_names?: string[];
  comments?: string[];
} & BulkWriteBodyRestriction;
