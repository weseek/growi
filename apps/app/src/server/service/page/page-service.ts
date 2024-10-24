import type EventEmitter from 'events';

import type {
  HasObjectId,
  IPageInfo, IPageInfoForEntity, IUser,
} from '@growi/core';
import type { HydratedDocument, Types } from 'mongoose';

import type { IOptionsForCreate, IOptionsForUpdate } from '~/interfaces/page';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import type { CurrentPageYjsData } from '~/interfaces/yjs';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import type { PageDocument } from '~/server/models/page';

export interface IPageService {
  create(path: string, body: string, user: HasObjectId, options: IOptionsForCreate): Promise<HydratedDocument<PageDocument>>,
  forceCreateBySystem(path: string, body: string, options: IOptionsForCreate): Promise<PageDocument>,
  updatePage(
    pageData: HydratedDocument<PageDocument>, body: string | null, previousBody: string | null, user: IUser, options: IOptionsForUpdate
  ): Promise<HydratedDocument<PageDocument>>,
  updateDescendantCountOfAncestors: (pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean) => Promise<void>,
  deleteCompletelyOperation: (pageIds: ObjectIdLike[], pagePaths: string[]) => Promise<void>,
  getEventEmitter: () => EventEmitter,
  deleteMultipleCompletely: (pages: ObjectIdLike[], user: IUser | undefined) => Promise<void>,
  findAncestorsChildrenByPathAndViewer(path: string, user, userGroups?): Promise<Record<string, PageDocument[]>>,
  findChildrenByParentPathOrIdAndViewer(
    parentPathOrId: string, user, userGroups?, showPagesRestrictedByOwner?: boolean, showPagesRestrictedByGroup?: boolean,
  ): Promise<PageDocument[]>,
  shortBodiesMapByPageIds(pageIds?: Types.ObjectId[], user?): Promise<Record<string, string | null>>,
  constructBasicPageInfo(page: PageDocument, isGuestUser?: boolean): IPageInfo | Omit<IPageInfoForEntity, 'bookmarkCount'>,
  normalizeAllPublicPages(): Promise<void>,
  canDelete(page: PageDocument, creatorId: ObjectIdLike | null, operator: any | null, isRecursively: boolean): boolean,
  canDeleteCompletely(
    page: PageDocument, creatorId: ObjectIdLike | null, operator: any | null, isRecursively: boolean, userRelatedGroups: PopulatedGrantedGroup[]
  ): boolean,
  canDeleteCompletelyAsMultiGroupGrantedPage(
    page: PageDocument, creatorId: ObjectIdLike | null, operator: any | null, userRelatedGroups: PopulatedGrantedGroup[]
  ): boolean,
  getYjsData(pageId: string, revisionBody?: string): Promise<CurrentPageYjsData>,
}
