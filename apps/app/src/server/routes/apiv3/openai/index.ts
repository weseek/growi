import express from 'express';

import { chatHandlersFactory } from './chat';

const router = express.Router();

module.exports = (crowi) => {
  router.get('/chat', chatHandlersFactory(crowi));
  return router;
};
