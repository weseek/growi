import type EventEmitter from 'events';

import type { IPageInfo, IPageInfoForEntity, IUser } from '@growi/core';
import type { ObjectId } from 'mongoose';

import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import type { IOptionsForCreate } from '~/server/models/interfaces/page-operation';
import type { PageDocument } from '~/server/models/page';

export interface IPageService {
  create(path: string, body: string, user: IUser, options: IOptionsForCreate): Promise<PageDocument>,
  updateDescendantCountOfAncestors: (pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean) => Promise<void>,
  deleteCompletelyOperation: (pageIds: string[], pagePaths: string[]) => Promise<void>,
  getEventEmitter: () => EventEmitter,
  deleteMultipleCompletely: (pages: ObjectIdLike[], user: IUser | undefined) => Promise<void>,
  findAncestorsChildrenByPathAndViewer(path: string, user, userGroups?): Promise<Record<string, PageDocument[]>>,
  findChildrenByParentPathOrIdAndViewer(parentPathOrId: string, user, userGroups?): Promise<PageDocument[]>,
  shortBodiesMapByPageIds(pageIds?: ObjectId[], user?): Promise<Record<string, string | null>>,
  constructBasicPageInfo(page: PageDocument, isGuestUser?: boolean): IPageInfo | IPageInfoForEntity,
  canDeleteCompletely(page: PageDocument, operator: any | null, isRecursively: boolean, userRelatedGroups: PopulatedGrantedGroup[]): boolean,
}
