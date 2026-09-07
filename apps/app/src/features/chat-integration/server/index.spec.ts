import express from 'express';
import request from 'supertest';

import { createChatIntegrationRouter } from './index';

describe('createChatIntegrationRouter', () => {
  it('returns an Express Router that can be mounted without throwing', () => {
    expect(() => {
      const app = express();
      app.use('/chat-integration', createChatIntegrationRouter());
    }).not.toThrow();
  });

  it('responds to a request under its mount path (no route yet, but does not crash the app)', async () => {
    const app = express();
    app.use('/chat-integration', createChatIntegrationRouter());

    // No route is registered yet (added by later tasks), so Express's
    // default "no route matched" behavior (404) is the expected response.
    // A 5xx here would mean the router crashed the request pipeline.
    const response = await request(app).get('/chat-integration/anything');
    expect(response.status).toBe(404);
  });
});
