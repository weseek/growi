import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Tag } from '~/interfaces/tag';

import { apiGet } from '../client/util/apiv1-client';


export type ITagsApiv1Result = {
  ok: boolean,
  tags: Tag[];
}

export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<Tag[], Error> => {
  return useSWRImmutable(['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then((response: ITagsApiv1Result) => response.tags));
};
