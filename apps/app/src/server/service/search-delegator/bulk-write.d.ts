export type AggregatedPage = Pick<Page,
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
  commets?: string[];
}
