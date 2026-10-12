import express, { type Express } from 'express';
import request from 'supertest';
import { mockDeep } from 'vitest-mock-extended';

import { BUNDLED_CATALOG_MODELS } from '~/features/mastra/server/services/ai-sdk-modules/model-catalog';
import { refreshModelCatalog } from '~/features/mastra/server/services/ai-sdk-modules/refresh-model-catalog';
import { isAiReady } from '~/features/mastra/server/services/is-ai-configured';
import type Crowi from '~/server/crowi';
import { generateUnavailableWhenMaintenanceModeMiddlewareForApi } from '~/server/middlewares/unavailable-when-maintenance-mode';
import { setup as setupApiV3 } from '~/server/routes/apiv3';
import { configManager } from '~/server/service/config-manager';
import { prisma } from '~/utils/prisma';

import type { AiUsageReport } from '../../../interfaces/ai-usage-report';

// Building the real apiv3 routers runs every route's setup; these two read
// singletons that only a full server boot instantiates.
vi.mock('~/server/service/import', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/server/service/import')>()),
  getImportService: () => ({}),
}));
vi.mock('~/server/service/export', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/server/service/export')>()),
  exportService: {},
}));

vi.mock(
  '~/features/mastra/server/services/ai-sdk-modules/fetch-model-catalog',
  () => ({
    fetchModelsDevCatalog: vi.fn(async () => BUNDLED_CATALOG_MODELS),
  }),
);

const ENDPOINT = '/_api/v3/ai-usage';
// A path that only the main apiv3 router (behind the maintenance check) could serve.
const PATH_BEHIND_MAINTENANCE_CHECK = '/_api/v3/ai-usage-probe-unmounted';

const sinceOneHourAgo = (): string =>
  new Date(Date.now() - 60 * 60 * 1000).toISOString();

describe('GET /_api/v3/ai-usage mounted on the real apiv3 routers', () => {
  const crowi = mockDeep<Crowi>();
  let app: Express;

  beforeAll(async () => {
    await configManager.loadConfigs();
    // apiv3 route setups look the User model up by name.
    const { default: userModelFactory } = await import('~/server/models/user');
    userModelFactory(crowi);

    app = express();
    // The apiv3 routers are module-level singletons, so build them only once.
    const [router, routerForAdmin] = setupApiV3(crowi, app);

    // Same order as server/routes/index.js.
    app.use('/_api/v3', routerForAdmin);
    app.use(
      '/_api/v3',
      generateUnavailableWhenMaintenanceModeMiddlewareForApi(crowi),
      router,
    );
  });

  beforeEach(async () => {
    crowi.appService.isMaintenanceMode.mockReturnValue(false);
    await prisma.mastrarefreshedmodelcatalogs.deleteMany();
  });

  afterEach(async () => {
    await prisma.mastrarefreshedmodelcatalogs.deleteMany();
  });

  it('answers 200 without any credentials', async () => {
    const res = await request(app)
      .get(ENDPOINT)
      .query({ since: sinceOneHourAgo() });

    expect(res.status).toBe(200);
    expect(res.body.windows).toHaveLength(1);
  });

  it('answers 200 while maintenance mode is on', async () => {
    crowi.appService.isMaintenanceMode.mockReturnValue(true);

    const blocked = await request(app).get(PATH_BEHIND_MAINTENANCE_CHECK);
    const res = await request(app)
      .get(ENDPOINT)
      .query({ since: sinceOneHourAgo() });

    expect(blocked.status).toBe(503);
    expect(res.status).toBe(200);
  });

  it('answers 200 while AI is not ready', async () => {
    expect(isAiReady()).toBe(false);

    const res = await request(app)
      .get(ENDPOINT)
      .query({ since: sinceOneHourAgo() });

    expect(res.status).toBe(200);
  });

  it('reports the refreshed catalog fetch time after a catalog refresh', async () => {
    const before = await request(app)
      .get(ENDPOINT)
      .query({ since: sinceOneHourAgo() });
    const beforeCatalog = (before.body as AiUsageReport).catalog;

    const { fetchedAt } = await refreshModelCatalog();

    const after = await request(app)
      .get(ENDPOINT)
      .query({ since: sinceOneHourAgo() });
    const afterCatalog = (after.body as AiUsageReport).catalog;

    expect(beforeCatalog.source).toBe('bundled');
    expect(afterCatalog).toEqual({
      source: 'refreshed',
      contentFetchedAt: fetchedAt.toISOString(),
    });
    expect(afterCatalog.contentFetchedAt).not.toBe(
      beforeCatalog.contentFetchedAt,
    );
  });
});
