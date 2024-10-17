import express from 'express';

import { postMessageHandlersFactory } from './message';
import { rebuildVectorStoreHandlersFactory } from './rebuild-vector-store';
import { createThreadHandlersFactory } from './thread';

const router = express.Router();

module.exports = (crowi) => {
  router.post('/rebuild-vector-store', rebuildVectorStoreHandlersFactory(crowi));

  // create thread
  router.post('/thread', createThreadHandlersFactory(crowi));
  // post message and return streaming with SSE
  router.post('/message', postMessageHandlersFactory(crowi));

  return router;
};
