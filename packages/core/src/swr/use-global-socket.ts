import type { Socket } from 'socket.io-client';
import type { SWRResponse } from 'swr';

import { useSWRStatic } from './use-swr-static';

export const GLOBAL_SOCKET_NS = '/';
export const GLOBAL_SOCKET_KEY = 'globalSocket';

export const useGlobalSocket = (): SWRResponse<Socket, Error> => {
  return useSWRStatic(GLOBAL_SOCKET_KEY);
};
