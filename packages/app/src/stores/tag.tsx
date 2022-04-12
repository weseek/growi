import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { ITagsListApiv1Result } from '~/interfaces/tag';

import { apiGet } from '../client/util/apiv1-client';


export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<ITagsListApiv1Result, Error> => {
  return useSWRImmutable(['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then(result => result as ITagsListApiv1Result));
};
