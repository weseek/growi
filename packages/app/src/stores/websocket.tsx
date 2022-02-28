import { SWRResponse } from 'swr';
import io, { Socket } from 'socket.io-client';

import { useStaticSWR } from './use-static-swr';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:stores:ui');

export const GLOBAL_SOCKET_NS = '/';
export const GLOBAL_SOCKET_KEY = 'globalSocket';

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
