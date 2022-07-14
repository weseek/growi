import { IPageHasId, Nullable } from '@growi/core';

import { IPageOperationProcessData } from './page-operation';

export type {
  IPage, IPageHasId, PageGrant, IPageInfo, IPageInfoForEntity, IPageInfoForOperation, IPageInfoForListing, IPageInfoAll,
  IDataWithMeta, IPageWithMeta, IPageToDeleteWithMeta, IPageToRenameWithMeta,
} from '@growi/core';

export {
  isIPageInfoForEntity, isIPageInfoForOperation, isIPageInfoForListing,
} from '@growi/core';

export type IPageForItem = Partial<IPageHasId & {isTarget?: boolean, processData?: IPageOperationProcessData}>;

export type IPageGrantData = {
  grant: number,
  grantedGroup?: {
    id: string,
    name: string
  }
}

export type IDeleteSinglePageApiv1Result = {
  ok: boolean
  path: string,
  isRecursively: Nullable<true>,
  isCompletely: Nullable<true>,
};

export type IDeleteManyPageApiv3Result = {
  paths: string[],
  isRecursively: Nullable<true>,
  isCompletely: Nullable<true>,
};
