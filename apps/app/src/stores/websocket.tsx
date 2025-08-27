import { useSWRStatic } from '@growi/core/dist/swr';
import type { Socket } from 'socket.io-client';
import type { SWRResponse } from 'swr';

export const GLOBAL_ADMIN_SOCKET_KEY = 'globalAdminSocket';

export const useGlobalAdminSocket = (): SWRResponse<Socket, Error> => {
  return useSWRStatic(GLOBAL_ADMIN_SOCKET_KEY);
};
