import useSWR, { mutate, responseInterface } from 'swr';
import { apiGet } from '~/client/js/util/apiv1-client';
import { apiv3Get } from '~/client/js/util/apiv3-client';

export const useMarkdownSettingsSWR = (path, initialData?: any): responseInterface<any, Error> => {
  return useSWR(
    '/markdown-setting',
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.markdownParams),
    {
      isEnabledLinebreaks: false,
      isEnabledLinebreaksInComments: false,
      pageBreakSeparator: 1,
      pageBreakCustomSeparator: '',
      isEnabledXss: false,
      xssOption: null,
      tagWhiteList: null,
      attrWhiteList: null,
    },
  );
};
