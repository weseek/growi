import { configManager } from '~/server/service/config-manager';
import { CONFIG_DEFINITIONS } from '~/server/service/config-manager/config-definition';

import {
  anonymousSyncThresholdConfigKeys,
  EXTERNAL_AUTH_THRESHOLD_KEY,
  getAnonymousSyncThreshold,
  OTHER_ENDPOINTS_THRESHOLD_KEY,
} from './anonymous-sync-thresholds';

const { mockError } = vi.hoisted(() => ({ mockError: vi.fn() }));

vi.mock('~/server/service/config-manager', () => ({
  configManager: { getConfig: vi.fn() },
}));

vi.mock('~/utils/logger', () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: mockError,
  })),
}));

describe('anonymousSyncThresholdConfigKeys', () => {
  it('declares the real req.originalUrl shape for each abuse-sensitive endpoint', () => {
    // Activity.endpoint is req.originalUrl — a bare route path like '/login' never
    // matches real traffic. API routes carry GROWI's /_api/v3 prefix; the external
    // sign-in routes live under /passport.
    expect(Object.keys(anonymousSyncThresholdConfigKeys)).toEqual([
      '/_api/v3/login',
      '/_api/v3/register',
      '/_api/v3/forgot-password',
      '/_api/v3/installer',
      EXTERNAL_AUTH_THRESHOLD_KEY,
    ]);
  });
});

describe('getAnonymousSyncThreshold', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('resolves the threshold through configManager, keyed by the matched endpoint', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(500);

    const threshold = getAnonymousSyncThreshold('/_api/v3/login');

    expect(threshold).toBe(500);
    expect(configManager.getConfig).toHaveBeenCalledWith(
      'app:auditLogEsSyncAnonymousThresholdLogin',
    );
  });

  it('reads a distinct configManager key per endpoint', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(100);

    getAnonymousSyncThreshold('/_api/v3/forgot-password');

    expect(configManager.getConfig).toHaveBeenCalledWith(
      'app:auditLogEsSyncAnonymousThresholdForgotPassword',
    );
  });

  it('resolves the external sign-in key to its own configManager key', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(40);

    const threshold = getAnonymousSyncThreshold(EXTERNAL_AUTH_THRESHOLD_KEY);

    expect(threshold).toBe(40);
    expect(configManager.getConfig).toHaveBeenCalledWith(
      'app:auditLogEsSyncAnonymousThresholdExternalAuth',
    );
  });

  it('resolves the shared key for unlisted endpoints to its own configManager key', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(77);

    const threshold = getAnonymousSyncThreshold(OTHER_ENDPOINTS_THRESHOLD_KEY);

    expect(threshold).toBe(77);
    expect(configManager.getConfig).toHaveBeenCalledWith(
      'app:auditLogEsSyncAnonymousThresholdOther',
    );
  });

  // The set of already-reported keys is module-level, so each test below uses a
  // distinct endpoint to stay independent of the others.

  it('falls back to the default when the configured value is not a number (e.g. parseInt of "abc")', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(Number.NaN);

    expect(getAnonymousSyncThreshold('/_api/v3/login')).toBe(
      CONFIG_DEFINITIONS['app:auditLogEsSyncAnonymousThresholdLogin']
        .defaultValue,
    );
  });

  it('falls back to the default when the configured value is negative', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(-1);

    expect(getAnonymousSyncThreshold('/_api/v3/register')).toBe(
      CONFIG_DEFINITIONS['app:auditLogEsSyncAnonymousThresholdRegister']
        .defaultValue,
    );
  });

  it('reports an invalid value only once, not on every event', () => {
    vi.mocked(configManager.getConfig).mockReturnValue(Number.NaN);

    getAnonymousSyncThreshold('/_api/v3/installer');
    getAnonymousSyncThreshold('/_api/v3/installer');
    getAnonymousSyncThreshold('/_api/v3/installer');

    expect(mockError).toHaveBeenCalledOnce();
  });
});
