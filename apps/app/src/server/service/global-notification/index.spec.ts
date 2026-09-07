import { PageGrant } from '@growi/core';
import type { IUser } from '@growi/core/dist/interfaces';
import { mock } from 'vitest-mock-extended';

import type Crowi from '~/server/crowi';
import type { PageDocument } from '~/server/models/page';

const {
  mailFire,
  slackFire,
  findGen2DestinationsForPathAndEvent,
  dispatchGen2Destination,
  dispatchAll,
} = vi.hoisted(() => ({
  mailFire: vi.fn().mockResolvedValue(undefined),
  slackFire: vi.fn().mockResolvedValue(undefined),
  findGen2DestinationsForPathAndEvent: vi.fn().mockResolvedValue([]),
  dispatchGen2Destination: vi.fn().mockResolvedValue(undefined),
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
  dispatchGen2Destination,
  findGen2DestinationsForPathAndEvent: (...args: unknown[]) =>
    findGen2DestinationsForPathAndEvent(...args),
}));

import { GlobalNotificationService } from '.';

describe('GlobalNotificationService.fire', () => {
  const triggeredBy = mock<IUser>();
  const page = mock<PageDocument>({
    path: '/a/b/c',
    grant: PageGrant.GRANT_PUBLIC,
    id: 'page-id',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    findGen2DestinationsForPathAndEvent.mockResolvedValue([]);
    dispatchAll.mockResolvedValue([]);
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
    const gen2Destinations = [{ platform: 'slack', channelId: 'C1' }];
    findGen2DestinationsForPathAndEvent.mockResolvedValue(gen2Destinations);

    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await service.fire('pageCreate', page, triggeredBy);

    expect(findGen2DestinationsForPathAndEvent).toHaveBeenCalledWith(
      '/a/b/c',
      'pageCreate',
    );
    expect(dispatchAll).toHaveBeenCalledWith(
      gen2Destinations,
      dispatchGen2Destination,
    );
  });

  it('still calls Gen 1 sends and Gen 2 dispatch even when there are no Gen 2 destinations configured', async () => {
    findGen2DestinationsForPathAndEvent.mockResolvedValue([]);

    const crowi = mock<Crowi>();
    const service = new GlobalNotificationService(crowi);

    await service.fire('pageCreate', page, triggeredBy);

    expect(mailFire).toHaveBeenCalled();
    expect(slackFire).toHaveBeenCalled();
    expect(dispatchAll).toHaveBeenCalledWith([], dispatchGen2Destination);
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
