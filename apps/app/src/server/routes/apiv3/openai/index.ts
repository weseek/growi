import express from 'express';

import { chatHandlersFactory } from './chat';

const router = express.Router();

module.exports = (crowi) => {
  router.post('/chat', chatHandlersFactory(crowi));
  return router;
};
