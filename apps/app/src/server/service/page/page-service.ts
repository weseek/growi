import type EventEmitter from 'events';

import type {
  HasObjectId,
  IPageInfo, IPageInfoForEntity, IUser,
} from '@growi/core';
import type { ObjectId } from 'mongoose';

import type { IOptionsForCreate, IOptionsForUpdate } from '~/interfaces/page';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import type { PageDocument } from '~/server/models/page';

export interface IPageService {
  create(path: string, body: string, user: HasObjectId, options: IOptionsForCreate): Promise<PageDocument>,
  forceCreateBySystem(path: string, body: string, options: IOptionsForCreate): Promise<PageDocument>,
  updatePage(pageData: PageDocument, body: string | null, previousBody: string | null, user: IUser, options: IOptionsForUpdate,): Promise<PageDocument>,
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
