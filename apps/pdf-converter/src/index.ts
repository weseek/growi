import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

import pdf from './routes/pdf';


const app = new Hono();
app.use(logger());
app.route('/', pdf);

const port = 3004;

serve({
  fetch: app.fetch,
  port,
});
