import { IPageInfoAll, IPageWithMeta } from './page';

export type IPageSearchMeta = {
  bookmarkCount?: number,
  elasticSearchResult?: {
    snippet: string;
    highlightedPath: string;
    isHtmlInPath: boolean;
  };
}

export const isIPageSearchMeta = (meta: IPageInfoAll | (IPageInfoAll & IPageSearchMeta) | undefined): meta is IPageInfoAll & IPageSearchMeta => {
  return meta != null && 'elasticSearchResult' in meta;
};

export type ISearchResult<T > = ISearchResultMeta & {
  data: T[],
}

export type ISearchResultMeta = {
  meta: {
    took?: number
    total: number
    hitsCount: number
  },
}

export type IFormattedSearchResult = ISearchResult<IPageWithMeta<IPageSearchMeta>>;

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
