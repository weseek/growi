import { useEffect } from 'react';

import io, { Socket } from 'socket.io-client';
import { SWRResponse } from 'swr';

import loggerFactory from '~/utils/logger';

import { useStaticSWR } from './use-static-swr';

const logger = loggerFactory('growi:stores:ui');

export const GLOBAL_SOCKET_NS = '/';
export const GLOBAL_SOCKET_KEY = 'globalSocket';

export const GLOBAL_ADMIN_SOCKET_NS = '/admin';
export const GLOBAL_ADMIN_SOCKET_KEY = 'globalAdminSocket';

/*
 * Global Socket
 */
export const useSetupGlobalSocket = (): void => {

  const { mutate } = useStaticSWR(GLOBAL_SOCKET_KEY);

  useEffect(() => {
    const socket = io(GLOBAL_SOCKET_NS, {
      transports: ['websocket'],
    });

    socket.on('error', (err) => { logger.error(err) });
    socket.on('connect_error', (err) => { logger.error('Failed to connect with websocket.', err) });

    mutate(socket);

  }, [mutate]);
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

export const useSetupGlobalSocketForPage = (pageId: string | undefined): void => {
  const { data: socket } = useGlobalSocket();

  useEffect(() => {
    if (socket == null || pageId == null) { return }

    socket.emit('join:page', { socketId: socket.id, pageId });
  }, [pageId, socket]);
};
