import type { IPageHasId, Nullable } from '@growi/core/dist/interfaces';

import type { IPageOperationProcessData } from './page-operation';

export { PageGrant } from '@growi/core/dist/interfaces';
export type {
  IPage, IPageHasId, IPageInfo, IPageInfoForEntity, IPageInfoForOperation, IPageInfoForListing, IPageInfoAll,
  IDataWithMeta, IPageWithMeta, IPageToDeleteWithMeta, IPageToRenameWithMeta,
} from '@growi/core/dist/interfaces';

export {
  isIPageInfoForEntity, isIPageInfoForOperation, isIPageInfoForListing,
} from '@growi/core/dist/interfaces';

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
