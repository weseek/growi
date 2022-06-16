import { SWRResponse } from 'swr';
import io, { Socket } from 'socket.io-client';

import { useStaticSWR } from './use-static-swr';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:stores:ui');

export const GLOBAL_SOCKET_NS = '/';
export const GLOBAL_SOCKET_KEY = 'globalSocket';

export const GLOBAL_ADMIN_SOCKET_NS = '/admin';
export const GLOBAL_ADMIN_SOCKET_KEY = 'globalAdminSocket';

/*
 * Global Socket
 */
export const useSetupGlobalSocket = (): SWRResponse<Socket, Error> => {
  const socket = io(GLOBAL_SOCKET_NS, {
    transports: ['websocket'],
  });

  socket.on('error', (err) => { logger.error(err) });
  socket.on('connect_error', (err) => { logger.error('Failed to connect with websocket.', err) });

  return useStaticSWR(GLOBAL_SOCKET_KEY, socket);
};

export const useGlobalSocket = (): SWRResponse<Socket, Error> => {
  return useStaticSWR(GLOBAL_SOCKET_KEY);
};

/*
 * Global Admin Socket
 */
export const useSetupGlobalAdminSocket = (shouldInit: boolean): SWRResponse<Socket, Error> => {
  let socket: Socket | undefined;

  if (shouldInit) {
    socket = io(GLOBAL_ADMIN_SOCKET_NS, {
      transports: ['websocket'],
    });

    socket.on('error', (err) => { logger.error(err) });
    socket.on('connect_error', (err) => { logger.error('Failed to connect with websocket.', err) });
  }

  return useStaticSWR(shouldInit ? GLOBAL_ADMIN_SOCKET_KEY : null, socket);
};

export const useGlobalAdminSocket = (): SWRResponse<Socket, Error> => {
  return useStaticSWR(GLOBAL_ADMIN_SOCKET_KEY);
};
