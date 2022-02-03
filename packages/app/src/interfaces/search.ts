import { IPageWithMeta } from './page';

export enum CheckboxType {
  NONE_CHECKED = 'noneChecked',
  INDETERMINATE = 'indeterminate',
  ALL_CHECKED = 'allChecked',
}

export type IPageSearchMeta = {
  elasticSearchResult?: {
    snippet: string;
    highlightedPath: string;
    isHtmlInPath: boolean;
  };
}

export const isIPageSearchMeta = (meta: any): meta is IPageSearchMeta => {
  return !!(meta as IPageSearchMeta)?.elasticSearchResult;
};

export type IFormattedSearchResult = {
  data: IPageWithMeta<IPageSearchMeta>[]

  totalCount: number

  meta: {
    total: number
    took?: number
    count?: number
  }
}

export const SORT_AXIS = {
  RELATION_SCORE: 'relationScore',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;
export type SORT_AXIS = typeof SORT_AXIS[keyof typeof SORT_AXIS];

export const SORT_ORDER = {
  DESC: 'desc',
  ASC: 'asc',
} as const;
export type SORT_ORDER = typeof SORT_ORDER[keyof typeof SORT_ORDER];

export type SearchResultMeta = {
  took?: number,
  total?: number,
  results?: number
};
