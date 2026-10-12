// --- Mock boundary ---------------------------------------------------------
//
// The jobs module wires two opt-in triggers around refreshModelCatalog:
//   - isAiEnabled        : mocked — the AI-feature gate that fronts BOTH
//     triggers (a refresh only runs when the AI feature itself is enabled)
//   - configManager      : mocked — drives the opt-in guards (Req 9.6)
//   - node-cron          : mocked — asserts whether/what gets scheduled and
//     lets the test fire the tick callback deterministically
//   - refreshModelCatalog: mocked — the refresh behavior itself is covered by
//     refresh-model-catalog.spec.ts; here only the trigger contract matters
const { isAiEnabled } = vi.hoisted(() => ({ isAiEnabled: vi.fn() }));
vi.mock('./is-ai-enabled', () => ({ isAiEnabled }));

const { readAiDisabledReason } = vi.hoisted(() => ({
  readAiDisabledReason: vi.fn(),
}));
vi.mock('~/features/ai-usage/server', () => ({
  readAiDisabledReason,
  AI_DISABLED_REASON_CATALOG_STALE: 'catalog_stale',
}));

const { getConfig } = vi.hoisted(() => ({ getConfig: vi.fn() }));
vi.mock('~/server/service/config-manager', () => ({
  configManager: { getConfig },
}));

const { cronScheduleMock, scheduledTask } = vi.hoisted(() => ({
  cronScheduleMock: vi.fn(),
  scheduledTask: { start: vi.fn(), stop: vi.fn() },
}));
vi.mock('node-cron', () => ({
  default: { schedule: cronScheduleMock },
}));

const { refreshModelCatalog } = vi.hoisted(() => ({
  refreshModelCatalog: vi.fn(),
}));
vi.mock('./ai-sdk-modules/refresh-model-catalog', () => ({
  refreshModelCatalog,
}));

import {
  startModelCatalogRefreshCronIfEnabled,
  triggerModelCatalogRefreshOnStartupIfEnabled,
} from './model-catalog-refresh-jobs';

const setConfig = (overrides: Record<string, unknown>): void => {
  getConfig.mockImplementation((key: string) => overrides[key]);
};

beforeEach(() => {
  vi.clearAllMocks();
  cronScheduleMock.mockReturnValue(scheduledTask);
  // AI enabled is the common case; the AI-off gate is asserted explicitly below.
  isAiEnabled.mockReturnValue(true);
  readAiDisabledReason.mockReturnValue(undefined);
});

const disableAi = (reason: string | undefined): void => {
  isAiEnabled.mockReturnValue(false);
  readAiDisabledReason.mockReturnValue(reason);
};

describe('startModelCatalogRefreshCronIfEnabled (Req 9.3, 9.6)', () => {
  it('does NOT schedule anything when AI is disabled with no disabled reason, even with a valid schedule (Req 6.2)', () => {
    disableAi(undefined);
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '0 4 * * *' });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).not.toHaveBeenCalled();
  });

  it('does NOT schedule anything when AI is disabled for a reason other than catalog_stale (Req 6.2)', () => {
    disableAi('maintenance');
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '0 4 * * *' });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).not.toHaveBeenCalled();
  });

  it('still schedules when AI is disabled with the catalog_stale reason (Req 6.1)', () => {
    disableAi('catalog_stale');
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '0 4 * * *' });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).toHaveBeenCalledTimes(1);
    expect(scheduledTask.start).toHaveBeenCalledTimes(1);
  });

  it('does NOT schedule anything when the cron config is unset (opt-in default)', () => {
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': undefined });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).not.toHaveBeenCalled();
  });

  it('does NOT schedule anything when the cron config is blank', () => {
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '   ' });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).not.toHaveBeenCalled();
  });

  it('schedules with the configured expression and starts the job (Req 9.3)', () => {
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '0 4 * * *' });

    startModelCatalogRefreshCronIfEnabled();

    expect(cronScheduleMock).toHaveBeenCalledTimes(1);
    expect(cronScheduleMock.mock.calls[0][0]).toBe('0 4 * * *');
    expect(scheduledTask.start).toHaveBeenCalledTimes(1);
  });

  it('runs the refresh when the scheduled tick fires', async () => {
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': '0 4 * * *' });
    refreshModelCatalog.mockResolvedValue({
      counts: {},
      fetchedAt: new Date(),
    });

    startModelCatalogRefreshCronIfEnabled();

    // Fire the captured tick callback (what node-cron would invoke).
    const tick = cronScheduleMock.mock.calls[0][1] as () => Promise<void>;
    await tick();

    expect(refreshModelCatalog).toHaveBeenCalledTimes(1);
  });

  it('does not throw when scheduling fails (e.g. invalid expression) — boot must survive (Req 9.4)', () => {
    setConfig({ 'ai:modelCatalogRefreshCronSchedule': 'not a cron expr' });
    cronScheduleMock.mockImplementation(() => {
      throw new Error('invalid cron expression');
    });

    expect(() => startModelCatalogRefreshCronIfEnabled()).not.toThrow();
  });
});

describe('triggerModelCatalogRefreshOnStartupIfEnabled (Req 9.2, 9.6)', () => {
  it('does nothing when AI is disabled with no disabled reason, even with the startup option on (Req 6.2)', () => {
    disableAi(undefined);
    setConfig({ 'ai:modelCatalogRefreshOnStartup': true });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).not.toHaveBeenCalled();
  });

  it('does nothing when AI is disabled for a reason other than catalog_stale (Req 6.2)', () => {
    disableAi('maintenance');
    setConfig({ 'ai:modelCatalogRefreshOnStartup': true });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).not.toHaveBeenCalled();
  });

  it('fetches at startup when AI is disabled with the catalog_stale reason (Req 6.1, 6.7)', () => {
    disableAi('catalog_stale');
    setConfig({ 'ai:modelCatalogRefreshOnStartup': true });
    refreshModelCatalog.mockResolvedValue({
      counts: {},
      fetchedAt: new Date(),
    });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).toHaveBeenCalledTimes(1);
  });

  it('does NOT fetch at startup with the startup option off even when the catalog_stale reason is set (Req 6.7)', () => {
    disableAi('catalog_stale');
    setConfig({ 'ai:modelCatalogRefreshOnStartup': false });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).not.toHaveBeenCalled();
  });

  it('does nothing when the startup option is off', () => {
    setConfig({ 'ai:modelCatalogRefreshOnStartup': false });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).not.toHaveBeenCalled();
  });

  it('fires the refresh when the startup option is on (Req 9.2)', () => {
    setConfig({ 'ai:modelCatalogRefreshOnStartup': true });
    refreshModelCatalog.mockResolvedValue({
      counts: {},
      fetchedAt: new Date(),
    });

    triggerModelCatalogRefreshOnStartupIfEnabled();

    expect(refreshModelCatalog).toHaveBeenCalledTimes(1);
  });

  it('swallows a refresh failure (fire-and-forget; boot never fails) (Req 9.2, 9.4)', async () => {
    setConfig({ 'ai:modelCatalogRefreshOnStartup': true });
    let rejectRefresh: (err: Error) => void = () => {};
    refreshModelCatalog.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectRefresh = reject;
        }),
    );

    expect(() => triggerModelCatalogRefreshOnStartupIfEnabled()).not.toThrow();

    // Reject AFTER the trigger returned — the .catch handler must absorb it
    // (an unhandled rejection would fail this test via vitest's process hooks).
    rejectRefresh(new Error('offline'));
    await new Promise((resolve) => setImmediate(resolve));
  });
});
