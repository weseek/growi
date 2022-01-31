import useSWR, { SWRResponse } from 'swr';
import { ITagDataHasId } from '~/interfaces/tag';
import { apiGet } from '~/client/util/apiv1-client';

type ITagDataResponse = {
  data: ITagDataHasId[],
  totalCount: number,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxTagList = (
    limit: number,
    offset: number,
): SWRResponse<ITagDataResponse, Error> => {
  return useSWR(
    `/tags.list?limit=${limit}&offset=${offset}`,
    endpoint => apiGet(endpoint).then((response: ITagDataResponse) => {
      return {
        data: response.data,
        totalCount: response.totalCount,
      };
    }),
  );
};
