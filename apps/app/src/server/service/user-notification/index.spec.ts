import { mock } from 'vitest-mock-extended';

const { dispatchAll } = vi.hoisted(() => ({
  dispatchAll: vi.fn().mockResolvedValue([]),
}));

vi.mock('~/features/chat-integration/server/notification', () => ({
  DestinationRegistry: vi.fn().mockImplementation((destinations) => ({
    destinations,
    dispatchAll: (dispatch: (d: unknown) => Promise<void>) =>
      dispatchAll(destinations, dispatch),
  })),
  dispatchGen2Destination: vi.fn(),
}));

vi.mock('../growi-info', () => ({
  growiInfoService: { getSiteUrl: () => 'https://growi.example.com' },
}));

vi.mock('../../util/slack', () => ({
  prepareSlackMessageForComment: vi.fn().mockReturnValue({}),
  prepareSlackMessageForPage: vi.fn().mockReturnValue({}),
}));

import type Crowi from '~/server/crowi';

import { UserNotificationService } from '.';

describe('UserNotificationService.fire', () => {
  const user = { username: 'someone' };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchAll.mockResolvedValue([]);
  });

  it('dispatches Gen 2 destinations even when Slack is not configured and Gen 1 was not requested', async () => {
    const crowi = mock<Crowi>({
      appService: { getAppTitle: () => 'GROWI' },
      slackIntegrationService: { isSlackConfigured: false },
    });
    const service = new UserNotificationService(crowi);
    const page = { path: '/a', updateSlackChannels: vi.fn() };
    const gen2Destinations = [{ platform: 'slack', channelId: 'C1' }];

    const results = await service.fire(
      page,
      user,
      '', // no Gen 1 slack channels requested
      'create',
      undefined,
      {},
      gen2Destinations,
      false, // isSlackEnabled: caller explicitly did not request Gen 1
    );

    expect(dispatchAll).toHaveBeenCalledWith(
      gen2Destinations,
      expect.any(Function),
    );
    expect(results).toEqual([]);
    // Gen 1 was not requested, so the page's stored slackChannels field
    // must be left untouched, not cleared.
    expect(page.updateSlackChannels).not.toHaveBeenCalled();
  });

  it('still runs Gen 1 (including page.updateSlackChannels) when isSlackEnabled is true even with an empty channel string', async () => {
    // Regression test: a user can enable the "post to Slack" toggle while
    // leaving/clearing the channels text field (SlackNotification.tsx keeps
    // these as independent form state). Before this fix, an early return
    // keyed on "channel array is empty" skipped page.updateSlackChannels()
    // entirely in this case, leaving the page's stored slackChannels field
    // stale instead of persisting the explicitly-saved empty value.
    const postMessage = vi.fn().mockResolvedValue(undefined);
    const crowi = mock<Crowi>({
      appService: { getAppTitle: () => 'GROWI' },
      slackIntegrationService: {
        isSlackConfigured: true,
        postMessage,
      },
    });
    const service = new UserNotificationService(crowi);
    const page = { path: '/a', updateSlackChannels: vi.fn() };

    const results = await service.fire(
      page,
      user,
      '', // channels field was cleared
      'create',
      undefined,
      {},
      [],
      true, // isSlackEnabled: caller explicitly requested Gen 1
    );

    expect(page.updateSlackChannels).toHaveBeenCalledWith('');
    expect(postMessage).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  it('still throws when Gen 1 Slack channels are requested but Slack is not configured (Gen 1 behavior unchanged)', async () => {
    const crowi = mock<Crowi>({
      appService: { getAppTitle: () => 'GROWI' },
      slackIntegrationService: { isSlackConfigured: false },
    });
    const service = new UserNotificationService(crowi);
    const page = { path: '/a', updateSlackChannels: vi.fn() };

    await expect(service.fire(page, user, 'general', 'create')).rejects.toThrow(
      'slackIntegrationService has not been set up',
    );

    // Gen 2 still ran (with an empty set here) before the Gen 1 throw.
    expect(dispatchAll).toHaveBeenCalledWith([], expect.any(Function));
  });

  it('sends to Gen 1 Slack channels as before when Slack is configured', async () => {
    const postMessage = vi.fn().mockResolvedValue(undefined);
    const crowi = mock<Crowi>({
      appService: { getAppTitle: () => 'GROWI' },
      slackIntegrationService: {
        isSlackConfigured: true,
        postMessage,
      },
    });
    const service = new UserNotificationService(crowi);
    const page = { path: '/a', updateSlackChannels: vi.fn() };

    const results = await service.fire(page, user, 'general,dev', 'create');

    expect(page.updateSlackChannels).toHaveBeenCalledWith('general,dev');
    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });
});
