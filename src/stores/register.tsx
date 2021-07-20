import useSWR, { SWRResponse } from 'swr';
import { ConfigInterface } from 'swr/dist/types';
// import { apiGet } from '~/client/js/util/apiv1-client';

// export const useCheckUsernameSWR = <Data, Error>(username?: string, config?: ConfigInterface): SWRResponse<Data, Error> => {
//   return useSWR(
//     ['/check_username', username],
//     (endpoint, username) => apiGet(endpoint, { username }).then(response => response.valid),
//     config,
//   );
// };
