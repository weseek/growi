import type { IUser, Ref } from '@growi/core';

import type { IVectorStore } from './vector-store';

export interface IThreadRelation {
  userId: Ref<IUser>
  vectorStore: Ref<IVectorStore>
  threadId: string;
  expiredAt: Date;
}
