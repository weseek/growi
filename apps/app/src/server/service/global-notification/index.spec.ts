import { PageGrant } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';
import { mock } from 'vitest-mock-extended';

import type Crowi from '~/server/crowi';
import type { PageDocument } from '~/server/models/page';

const {
  mailFire,
  slackFire,
  findGen2DestinationsForPathAndEvent,
  createGen2NotificationDispatcher,
  dispatchAll,
} = vi.hoisted(() => ({
  mailFire: vi.fn().mockResolvedValue(undefined),
  slackFire: vi.fn().mockResolvedValue(undefined),
  findGen2DestinationsForPathAndEvent: vi.fn().mockResolvedValue([]),
  createGen2NotificationDispatcher: vi.fn().mockReturnValue(vi.fn()),
  dispatchAll: vi.fn().mockResolvedValue([]),
}));

vi.mock('./global-notification-mail', () => ({
  GlobalNotificationMailService: vi.fn().mockImplementation(() => ({
    fire: mailFire,
  })),
}));
vi.mock('./global-notification-slack', () => ({
  GlobalNotificationSlackService: vi.fn().mockImplementation(() => ({
    fire: slackFire,
  })),
}));

vi.mock('~/features/chat-integration/server/notification', () => ({
  DestinationRegistry: vi.fn().mockImplementation((destinations) => ({
    destinations,
    dispatchAll: (dispatch: (d: unknown) => Promise<void>) =>
      dispatchAll(destinations, dispatch),
  })),
  createGen2NotificationDispatcher,
  findGen2DestinationsForPathAndEvent: (...args: unknown[]) =>
    findGen2DestinationsForPathAndEvent(...args),
}));

vi.mock('../growi-info', () => ({
  growiInfoService: { getSiteUrl: () => 'https://growi.example.com' },
}));

import { GlobalNotificationService } from '.';

describe('GlobalNotificationService.fire', () => {
  const triggeredBy = mock<IUser>({ username: 'someone' });
  const page = mock<PageDocument>({
    path: '/a/b/c',
    grant: PageGrant.GRANT_PUBLIC,
    id: 'page-id',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    findGen2DestinationsForPathAndEvent.mockResolvedValue([]);
    dispatchAll.mockResolvedValue([]);
    createGen2NotificationDispatcher.mockReturnValue(vi.fn());
  });

  it("calls Gen 1's mail and slack sends exactly as before (unchanged call shape)", async () => {
    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await service.fire('pageCreate', page, triggeredBy);

    expect(mailFire).toHaveBeenCalledWith('pageCreate', page, triggeredBy, {});
    expect(slackFire).toHaveBeenCalledWith(
      'pageCreate',
      'page-id',
      '/a/b/c',
      triggeredBy,
      {},
    );
  });

  it('additionally resolves and dispatches Gen 2 destinations for the same path + event', async () => {
    const gen2Destinations = [
      { relationId: 'rel-1', platform: 'slack', channelId: 'C1' },
    ];
    findGen2DestinationsForPathAndEvent.mockResolvedValue(gen2Destinations);

    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await service.fire('pageCreate', page, triggeredBy);

    expect(findGen2DestinationsForPathAndEvent).toHaveBeenCalledWith(
      '/a/b/c',
      'pageCreate',
    );
    // The content (markdown/containsRestrictedPage) is built once and
    // threaded into the dispatcher factory before dispatch -- proves
    // enqueue receives NotificationContent's output, not a placeholder.
    expect(createGen2NotificationDispatcher).toHaveBeenCalledWith(
      expect.stringContaining('someone created'),
      false,
    );
    expect(dispatchAll).toHaveBeenCalledWith(
      gen2Destinations,
      expect.any(Function),
    );
  });

  it('does NOT resolve Gen 2 destinations at all when there are none configured (no content built, no dispatch)', async () => {
    findGen2DestinationsForPathAndEvent.mockResolvedValue([]);

    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await service.fire('pageCreate', page, triggeredBy);

    expect(mailFire).toHaveBeenCalled();
    expect(slackFire).toHaveBeenCalled();
    expect(createGen2NotificationDispatcher).not.toHaveBeenCalled();
    expect(dispatchAll).not.toHaveBeenCalled();
  });

  it('does not let a Gen 2 dispatch failure reject fire() after Gen 1 already sent', async () => {
    findGen2DestinationsForPathAndEvent.mockRejectedValue(
      new Error('db unavailable'),
    );

    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await expect(
      service.fire('pageCreate', page, triggeredBy),
    ).resolves.toBeUndefined();
    expect(mailFire).toHaveBeenCalled();
    expect(slackFire).toHaveBeenCalled();
  });
});
