import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

import pdf from './routes/pdf';


const app = new Hono();
app.use(logger());
const routes = app.route('/pdf', pdf);

const port = 3004;

serve({
  fetch: app.fetch,
  port,
});

export type PdfConverterRoutes = typeof routes;
