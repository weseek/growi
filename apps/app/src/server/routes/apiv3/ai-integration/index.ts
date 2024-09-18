import express from 'express';

import { chatHandlersFactory } from './chat';
import { recreateVectorStoreHandlersFactory } from './recreate-vector-store';

const router = express.Router();

module.exports = (crowi) => {
  router.post('/chat', chatHandlersFactory(crowi));
  router.put('/recreate-vector-store', recreateVectorStoreHandlersFactory(crowi));
  return router;
};
