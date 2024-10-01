import express from 'express';

import { chatHandlersFactory } from './chat';
import { rebuildVectorStoreHandlersFactory } from './rebuild-vector-store';

const router = express.Router();

module.exports = (crowi) => {
  router.post('/chat', chatHandlersFactory(crowi));
  router.post('/rebuild-vector-store', rebuildVectorStoreHandlersFactory(crowi));
  return router;
};
