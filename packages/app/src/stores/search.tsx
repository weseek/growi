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

export type ISearchConditions = {
  q: string,
  configurations: ISearchConfigurations,
}

const createSearchQuery = (keyword: string, includeTrashPages = false, includeUserPages = false): string => {
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
    includeTrashPages, includeUserPages,
  } = configurations;

  const rawQuery = createSearchQuery(keyword, includeTrashPages, includeUserPages);

  const swrResult = useSWRImmutable(
    ['/search', keyword, configurations],
    (endpoint, keyword, configurations) => {
      const {
        limit, offset, sort, order,
      } = configurations;

      return apiGet(
        endpoint, {
          q: encodeURIComponent(rawQuery),
          limit,
          offset: offset ?? 0,
          sort: sort ?? SORT_AXIS.RELATION_SCORE,
          order: order ?? SORT_ORDER.DESC,
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).then(result => result as IFormattedSearchResult);
    },
  );

  return {
    ...swrResult,
    q: rawQuery,
    configurations,
  };
};
