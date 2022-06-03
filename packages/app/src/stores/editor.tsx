import useSWR, { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { Nullable } from '~/interfaces/common';
import { apiGet } from '~/client/util/apiv1-client';
import { SlackChannels } from '~/interfaces/user-trigger-notification';


/*
* Slack Notification
*/

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return (
    useStaticSWR('isSlackEnabled', isEnabled || null, { fallbackData: initialData })
  );
};

export const useSWRxSlackChannels = (currentPagePath: Nullable<string>): SWRResponse<string[], Error> => {
  const shouldFetch: boolean = currentPagePath != null;
  return useSWR(
    shouldFetch ? ['/pages.updatePost', currentPagePath] : null,
    (endpoint, path) => apiGet(endpoint, { path }).then((response: SlackChannels) => response.updatePost),
    { fallbackData: [''] },
  );
};
