import type EventEmitter from 'events';

import type { IUser } from '@growi/core';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import type { IOptionsForCreate } from '~/server/models/interfaces/page-operation';
import type { PageDocument } from '~/server/models/page';

export interface IPageService {
  create(path: string, body: string, user: IUser, options: IOptionsForCreate): Promise<PageDocument>,
  updateDescendantCountOfAncestors: (pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean) => Promise<void>,
  deleteCompletelyOperation: (pageIds: string[], pagePaths: string[]) => Promise<void>,
  getEventEmitter: () => EventEmitter,
  deleteMultipleCompletely: (pages: ObjectIdLike[], user: IUser | undefined) => Promise<void>,
}
