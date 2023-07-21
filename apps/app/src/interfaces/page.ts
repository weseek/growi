import type { IPageHasId, Nullable } from '@growi/core';

import type { IPageOperationProcessData } from './page-operation';

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
