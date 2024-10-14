import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { hc } from 'hono/client';
import { logger } from 'hono/logger';

import pdf from './routes/pdf';


const app = new Hono();
app.use(logger());
const routes = app.route('/pdf', pdf);

const port = 3010;

serve({
  fetch: app.fetch,
  port,
});

const client = hc<typeof routes>('');
export type Client = typeof client

export const pdfConverterHc = (...args: Parameters<typeof hc>): Client => hc<typeof routes>(...args);
