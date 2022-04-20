import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';

import { IFormattedSearchResult, SORT_AXIS, SORT_ORDER } from '~/interfaces/search';

import { ITermNumberManagerUtil, useTermNumberManager } from './use-static-swr';


export const useFullTextSearchTermManager = (isDisabled?: boolean) : SWRResponse<number, Error> & ITermNumberManagerUtil => {
  return useTermNumberManager(isDisabled === true ? null : 'fullTextSearchTermNumber');
};


export type ISearchConfigurations = {
  limit: number,
  offset?: number,
  sort?: SORT_AXIS,
  order?: SORT_ORDER,
  includeTrashPages?: boolean,
  includeUserPages?: boolean,
}

type ISearchConfigurationsFixed = {
  limit: number,
  offset: number,
  sort: SORT_AXIS,
  order: SORT_ORDER,
  includeTrashPages: boolean,
  includeUserPages: boolean,
}

export type ISearchConditions = ISearchConfigurationsFixed & {
  keyword: string | null,
  rawQuery: string,
}

const createSearchQuery = (keyword: string, includeTrashPages: boolean, includeUserPages: boolean): string => {
  let query = keyword;

  // pages included in specific path are not retrived when prefix is added
  if (!includeTrashPages) {
    query = `${query} -prefix:/trash`;
  }
  if (!includeUserPages) {
    query = `${query} -prefix:/user`;
  }

  return query;
};

export const useSWRxSearch = (
    keyword: string | null, nqName: string | null, configurations: ISearchConfigurations, disableTermManager = false,
): SWRResponse<IFormattedSearchResult, Error> & { conditions: ISearchConditions } => {
  const { data: termNumber } = useFullTextSearchTermManager(disableTermManager);

  const {
    limit, offset, sort, order, includeTrashPages, includeUserPages,
  } = configurations;

  const fixedConfigurations: ISearchConfigurationsFixed = {
    limit,
    offset: offset ?? 0,
    sort: sort ?? SORT_AXIS.RELATION_SCORE,
    order: order ?? SORT_ORDER.DESC,
    includeTrashPages: includeTrashPages ?? false,
    includeUserPages: includeUserPages ?? false,
  };
  const rawQuery = createSearchQuery(keyword ?? '', fixedConfigurations.includeTrashPages, fixedConfigurations.includeUserPages);

  const isKeywordValid = keyword != null && keyword.length > 0;

  const swrResult = useSWRImmutable(
    isKeywordValid ? ['/search', keyword, fixedConfigurations, termNumber] : null,
    (endpoint, keyword, fixedConfigurations) => {
      const {
        limit, offset, sort, order,
      } = fixedConfigurations;

      return apiGet(
        endpoint, {
          q: encodeURIComponent(rawQuery),
          nq: typeof nqName === 'string' ? encodeURIComponent(nqName) : null,
          limit,
          offset,
          sort,
          order,
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).then(result => result as IFormattedSearchResult);
    },
  );

  return {
    ...swrResult,
    conditions: {
      keyword,
      rawQuery,
      ...fixedConfigurations,
    },
  };
};
