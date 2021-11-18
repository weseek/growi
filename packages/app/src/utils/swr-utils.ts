import { SWRConfiguration } from 'swr';

import axios from './axios';

export const swrGlobalConfiguration: SWRConfiguration = {
  fetcher: url => axios.get(url).then(res => res.data),
  revalidateOnFocus: false,
  errorRetryCount: 1,
};
