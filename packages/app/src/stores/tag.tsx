import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ITag } from '~/interfaces/tag';

import { apiGet } from '../client/util/apiv1-client';


export type ITagHasCount = ITag & { count: number }

export type ITagsApiv1Result = {
  ok: boolean,
  data: ITagHasCount[],
  totalCount: number,
}

export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<ITagsApiv1Result, Error> => {
  return useSWRImmutable(['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then(response => response as ITagsApiv1Result));
};
