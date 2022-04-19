import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { ITagCountHasId } from '~/interfaces/tag';
import { apiGet } from '~/client/util/apiv1-client';

type ITagDataListResponse = {
  data: ITagCountHasId[],
  totalCount: number,
}

export const useSWRxTagDataList = (
    limit: number,
    offset: number,
): SWRResponse<ITagDataListResponse, Error> => {
  return useSWR(
    `/tags.list?limit=${limit}&offset=${offset}`,
    endpoint => apiGet(endpoint).then((response: ITagDataListResponse) => {
      return {
        data: response.data,
        totalCount: response.totalCount,
      };
}))};


export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<ITagsListApiv1Result, Error> => {
  return useSWRImmutable(
    ['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then((result: ITagsListApiv1Result) => result),
  );
};
