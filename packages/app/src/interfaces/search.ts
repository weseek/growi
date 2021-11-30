import { IPageHasId } from './page';

export enum CheckboxType {
  NONE_CHECKED = 'noneChecked',
  INDETERMINATE = 'indeterminate',
  ALL_CHECKED = 'allChecked',
}

export type IPageSearchResultData = {
  pageData: IPageHasId,
  pageMeta: {
    bookmarkCount: number,
    elasticSearchResult: {
      snippet: string,
      highlightedPath: string,
    },
  },
}
