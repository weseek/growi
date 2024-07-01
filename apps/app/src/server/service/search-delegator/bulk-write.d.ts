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
