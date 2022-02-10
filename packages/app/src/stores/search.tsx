import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';

import { IFormattedSearchResult, SORT_AXIS, SORT_ORDER } from '~/interfaces/search';


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

export type ISearchConditions = {
  conditions: ISearchConfigurationsFixed & {
    keyword: string,
    rawQuery: string,
  }
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

export const useSWRxFullTextSearch = (
    keyword: string, configurations: ISearchConfigurations,
): SWRResponse<IFormattedSearchResult, Error> & ISearchConditions => {

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
  const rawQuery = createSearchQuery(keyword, fixedConfigurations.includeTrashPages, fixedConfigurations.includeUserPages);

  const swrResult = useSWRImmutable(
    ['/search', keyword, fixedConfigurations],
    (endpoint, keyword, fixedConfigurations) => {
      const {
        limit, offset, sort, order,
      } = fixedConfigurations;

      return apiGet(
        endpoint, {
          q: encodeURIComponent(rawQuery),
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
