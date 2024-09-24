import express from 'express';

import { chatHandlersFactory } from './chat';
import { postMessageHandlersFactory } from './message';
import { createThreadHandlersFactory } from './thread';
import { rebuildVectorStoreHandlersFactory } from './rebuild-vector-store';

const router = express.Router();

module.exports = (crowi) => {
  router.post('/rebuild-vector-store', rebuildVectorStoreHandlersFactory(crowi));

  // deprecated
  router.post('/chat', chatHandlersFactory(crowi));
  // create thread
  router.post('/thread', createThreadHandlersFactory(crowi));
  // post message and return streaming with SSE
  router.post('/message', postMessageHandlersFactory(crowi));

  return router;
};
