import type EventEmitter from 'events';

import type { IUser } from '@growi/core';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

export interface IPageService {
  updateDescendantCountOfAncestors: (pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean) => Promise<void>,
  deleteCompletelyOperation: (pageIds: string[], pagePaths: string[]) => Promise<void>,
  getEventEmitter: () => EventEmitter,
  deleteMultipleCompletely: (pages: ObjectIdLike[], user: IUser | undefined) => Promise<void>,
}
