// Task 3.4: 「投稿と差し替えを扱う」 -- post / postEphemeral / attachPreview /
// replace, plus the capability-driven choice of a lesser rendering on a
// service whose capability row is not `full`.
//
// What is asserted here is the observable contract of those four operations:
// which SDK call each one makes, what `PostOutcome` comes back, and -- for the
// rendering -- what a reader of the message can actually see. The Chat SDK's
// own posting behavior is third-party code and is not re-tested; where the
// thread-id format is at stake the assertion is a round trip through the
// *real* adapter (`channelIdFromThreadId`), never a hard-coded string, so the
// test cannot drift into re-stating an adapter's private encoding.
import { createDiscordAdapter } from '@chat-adapter/discord';
import { createSlackAdapter } from '@chat-adapter/slack';
import { createTeamsAdapter } from '@chat-adapter/teams';
import type {
  ChannelRef,
  ChatAccountRef,
  MessageRef,
  PlatformName,
} from '@growi/chat';
import type { Adapter, CardElement, StateAdapter } from 'chat';
import { createMattermostAdapter } from 'chat-adapter-mattermost';
import { mock } from 'vitest-mock-extended';

import type { OutboundMessage } from '../types/index.js';
import { decodeActionId } from './event-mapping.js';
import {
  attachPreview,
  channelThreadId,
  classifyOutboundFailure,
  type OutboundContext,
  post,
  postEphemeral,
  replace,
  toPostable,
} from './outbound.js';

const BOT_NAME = 'growi';

const channelOf = (platform: PlatformName, channelId: string): ChannelRef => ({
  platform,
  channelId,
  channelName: 'general',
  isPrivate: false,
});

/**
 * `Required<Adapter>` rather than `Adapter`: the SDK marks the optional
 * capabilities (`postChannelMessage`, `postEphemeral`, `openDM`) as `?`, and a
 * mock of the optional shape is typed as possibly-undefined, which no amount of
 * stubbing removes. A test that wants one of those *absent* removes it
 * explicitly instead (see the direct-message fallback below).
 */
const adapterMock = () => mock<Required<Adapter>>();

const contextOf = (adapter: Adapter): OutboundContext => ({
  adapter,
  state: mock<StateAdapter>(),
  botName: BOT_NAME,
});

const MARKDOWN: OutboundMessage = {
  kind: 'markdown',
  markdown: 'hello **world**',
};

const LIST: OutboundMessage = {
  kind: 'list',
  title: '検索結果',
  rows: [
    { markdown: '[/foo](https://growi.example/foo)', sourceLabel: 'wiki-a' },
    { markdown: '[/bar](https://growi.example/bar)', sourceLabel: 'wiki-b' },
  ],
  footer: '3 件中 2 件',
};

const CHOICE: OutboundMessage = {
  kind: 'choice',
  prompt: 'どの GROWI へ送りますか?',
  correlationId: 'corr-1',
  options: [
    { id: 'relation-a', label: 'wiki-a' },
    { id: 'relation-b', label: 'wiki-b' },
  ],
};

/** The four real adapters, constructible without any I/O (see adapter-set.spec.ts). */
const realAdapters: Readonly<Record<PlatformName, Adapter>> = {
  slack: createSlackAdapter({
    mode: 'socket',
    appToken: 'xapp-1',
    signingSecret: 's',
  }),
  discord: createDiscordAdapter({
    applicationId: 'app-id',
    publicKey: '0'.repeat(64),
    botToken: 'bot-token',
  }),
  teams: createTeamsAdapter({
    appId: 'teams-app',
    appPassword: 'teams-secret',
  }),
  mattermost: createMattermostAdapter({
    baseUrl: 'https://mattermost.example.com',
    botToken: 'mm-token',
  }),
};

/**
 * A channel id in exactly the form the rest of the app sees it: `event-mapping.ts`
 * reads `Thread.channelId`, which the SDK derives with `channelIdFromThreadId`.
 */
const realChannelIds: Readonly<Record<PlatformName, string>> = {
  slack: realAdapters.slack.channelIdFromThreadId(
    realAdapters.slack.encodeThreadId({
      channel: 'C123',
      threadTs: '1700000000.000100',
    }),
  ),
  discord: realAdapters.discord.channelIdFromThreadId(
    realAdapters.discord.encodeThreadId({
      guildId: 'G1',
      channelId: 'C1',
      threadId: 'T1',
    }),
  ),
  teams: realAdapters.teams.channelIdFromThreadId(
    realAdapters.teams.encodeThreadId({
      conversationId: '19:abc@thread.tacv2',
      serviceUrl: 'https://smba.example.com/',
    }),
  ),
  mattermost: realAdapters.mattermost.channelIdFromThreadId(
    realAdapters.mattermost.encodeThreadId({
      channelId: 'mmchan1',
      rootPostId: 'root1',
    }),
  ),
};

const PLATFORMS: ReadonlyArray<PlatformName> = [
  'slack',
  'discord',
  'teams',
  'mattermost',
];

const isCard = (postable: unknown): postable is CardElement =>
  typeof postable === 'object' &&
  postable !== null &&
  'type' in postable &&
  (postable as { type: unknown }).type === 'card';

const markdownOf = (postable: unknown): string => {
  if (
    typeof postable === 'object' &&
    postable !== null &&
    'markdown' in postable
  ) {
    return String((postable as { markdown: unknown }).markdown);
  }
  throw new Error(
    `expected a markdown postable, got ${JSON.stringify(postable)}`,
  );
};

/** Every button id anywhere inside a card, in document order. */
const buttonIdsOf = (card: CardElement): readonly string[] =>
  card.children.flatMap((child) =>
    child.type === 'actions'
      ? child.children.flatMap((action) =>
          action.type === 'button' ? [action.id] : [],
        )
      : [],
  );

const textOf = (card: CardElement): string =>
  card.children
    .flatMap((child) => (child.type === 'text' ? [child.content] : []))
    .join('\n');

describe('toPostable -- the capability table decides the rendering, not the service name', () => {
  it('renders a markdown message as markdown on every service', () => {
    for (const platform of PLATFORMS) {
      expect(markdownOf(toPostable(MARKDOWN, platform, BOT_NAME))).toBe(
        'hello **world**',
      );
    }
  });

  it('renders a list as a card where `card` is full', () => {
    for (const platform of ['slack', 'discord', 'teams'] as const) {
      const postable = toPostable(LIST, platform, BOT_NAME);
      expect(isCard(postable)).toBe(true);
      if (!isCard(postable)) return;

      expect(postable.title).toBe('検索結果');
      const rendered = textOf(postable);
      for (const row of LIST.kind === 'list' ? LIST.rows : []) {
        expect(rendered).toContain(row.markdown);
        expect(rendered).toContain(row.sourceLabel);
      }
    }
  });

  it('renders the same list as plain markdown where `card` is only degraded, losing no row', () => {
    // Mattermost is the one service whose `card` row is `degraded`; the
    // documented fallback is 「markdown で投稿する」.
    const postable = toPostable(LIST, 'mattermost', BOT_NAME);
    const rendered = markdownOf(postable);

    expect(rendered).toContain('検索結果');
    for (const row of LIST.kind === 'list' ? LIST.rows : []) {
      expect(rendered).toContain(row.markdown);
      expect(rendered).toContain(row.sourceLabel);
    }
    expect(rendered).toContain('3 件中 2 件');
  });

  it('renders a choice as pressable buttons where interactive actions work', () => {
    for (const platform of ['slack', 'discord', 'teams'] as const) {
      const postable = toPostable(CHOICE, platform, BOT_NAME);
      expect(isCard(postable)).toBe(true);
      if (!isCard(postable)) return;

      // The correlation id must travel inside the action id via the encode/decode
      // pair, or the press is un-resumable (Implementation Note 3.3).
      expect(buttonIdsOf(postable).map(decodeActionId)).toEqual([
        { correlationId: 'corr-1', actionId: 'relation-a' },
        { correlationId: 'corr-1', actionId: 'relation-b' },
      ]);
    }
  });

  it('renders the same choice as a numbered list answered by addressing the bot, where buttons do not work', () => {
    const rendered = markdownOf(toPostable(CHOICE, 'mattermost', BOT_NAME));

    expect(rendered).toContain('どの GROWI へ送りますか?');
    expect(rendered).toContain('1. wiki-a');
    expect(rendered).toContain('2. wiki-b');
    expect(rendered).toContain(`@${BOT_NAME}`);
  });
});

describe('channelThreadId', () => {
  it('addresses the channel it was given, on every service', () => {
    // A round trip through the adapter's own projection: whatever encoding the
    // adapter uses, the thread id this builds must name the same channel.
    for (const platform of PLATFORMS) {
      const adapter = realAdapters[platform];
      const channelId = realChannelIds[platform];

      expect(
        adapter.channelIdFromThreadId(
          channelThreadId(adapter, platform, channelId, null),
        ),
      ).toBe(channelId);
    }
  });

  it('still addresses the same channel when rooted at a message', () => {
    for (const platform of PLATFORMS) {
      const adapter = realAdapters[platform];
      const channelId = realChannelIds[platform];

      expect(
        adapter.channelIdFromThreadId(
          channelThreadId(adapter, platform, channelId, 'msg-1'),
        ),
      ).toBe(channelId);
    }
  });

  it('roots the reply at the target message where the service can express it', () => {
    // Slack and Mattermost carry a thread root in their thread id; Discord and
    // Teams do not, so a rooted request there is a plain channel post.
    for (const platform of ['slack', 'mattermost'] as const) {
      const adapter = realAdapters[platform];
      const channelId = realChannelIds[platform];

      expect(channelThreadId(adapter, platform, channelId, 'msg-1')).not.toBe(
        channelThreadId(adapter, platform, channelId, null),
      );
    }
  });
});

describe('post', () => {
  it('posts to the channel it is given and hands back the reference needed to replace it', async () => {
    const adapter = adapterMock();
    adapter.postChannelMessage.mockResolvedValue({
      id: 'posted-1',
      raw: {},
      threadId: 'slack:C123:1700000000.000100',
    });

    const outcome = await post(
      contextOf(adapter),
      channelOf('slack', 'slack:C123'),
      MARKDOWN,
    );

    expect(outcome).toEqual({ ok: true, messageId: 'posted-1' });
    expect(adapter.postChannelMessage).toHaveBeenCalledWith(
      'slack:C123',
      expect.anything(),
    );
  });

  it('reports that the bot is not in the channel, with a remedy, instead of throwing', async () => {
    const notInChannel = Object.assign(
      new Error('Slack chat.postMessage failed: not_in_channel'),
      {
        name: 'SlackApiError',
        response: { ok: false, error: 'not_in_channel' },
      },
    );
    const adapter = adapterMock();
    adapter.postChannelMessage.mockRejectedValue(notInChannel);

    const outcome = await post(
      contextOf(adapter),
      channelOf('slack', 'slack:C123'),
      MARKDOWN,
    );

    expect(outcome.ok).toBe(false);
    if (outcome.ok || outcome.reason !== 'bot-not-in-channel') {
      throw new Error(
        `expected bot-not-in-channel, got ${JSON.stringify(outcome)}`,
      );
    }
    expect(outcome.remedy).not.toBe('');
  });

  it('reports any other failure as a platform error, carrying the detail, instead of throwing', async () => {
    const adapter = adapterMock();
    adapter.postChannelMessage.mockRejectedValue(new Error('socket hang up'));

    const outcome = await post(
      contextOf(adapter),
      channelOf('slack', 'slack:C123'),
      MARKDOWN,
    );

    expect(outcome).toEqual({
      ok: false,
      reason: 'platform-error',
      detail: 'socket hang up',
    });
  });
});

describe('classifyOutboundFailure', () => {
  it('recognises every service own way of saying the bot cannot post to that channel', () => {
    const notInChannel: ReadonlyArray<unknown> = [
      // Slack: chat.postMessage returns ok:false with a named error.
      Object.assign(
        new Error('Slack chat.postMessage failed: channel_not_found'),
        {
          name: 'SlackApiError',
          response: { ok: false, error: 'channel_not_found' },
        },
      ),
      // Discord: the adapter wraps a non-ok HTTP response in NetworkError.
      Object.assign(
        new Error(
          'Discord API error: 403 {"message":"Missing Access","code":50001}',
        ),
        {
          name: 'NetworkError',
        },
      ),
      // Mattermost / Teams: @chat-adapter/shared PermissionError on HTTP 403.
      Object.assign(
        new Error('Bot lacks permission to post message in mattermost'),
        {
          name: 'PermissionError',
        },
      ),
    ];

    for (const error of notInChannel) {
      expect(classifyOutboundFailure(error).reason).toBe('bot-not-in-channel');
    }
  });

  it('does not mistake an authentication or rate-limit failure for a missing invitation', () => {
    const others: ReadonlyArray<unknown> = [
      Object.assign(new Error('Token expired'), {
        name: 'AuthenticationError',
      }),
      Object.assign(new Error('Rate limited by slack'), {
        name: 'RateLimitError',
      }),
      'a thrown string',
    ];

    for (const error of others) {
      expect(classifyOutboundFailure(error).reason).toBe('platform-error');
    }
  });
});

describe('postEphemeral', () => {
  const user: ChatAccountRef = {
    platform: 'slack',
    accountId: 'U1',
    displayName: 'Someone',
  };

  it('sends a message only that user can see, natively where the service offers it', async () => {
    const adapter = adapterMock();
    adapter.postEphemeral.mockResolvedValue({
      id: 'eph-1',
      raw: {},
      threadId: 'slack:C123:',
      usedFallback: false,
    });

    const outcome = await postEphemeral(
      contextOf(adapter),
      channelOf('slack', 'slack:C123'),
      user,
      MARKDOWN,
    );

    expect(outcome).toEqual({ ok: true, messageId: 'eph-1' });
    expect(adapter.postEphemeral).toHaveBeenCalledWith(
      'slack:C123',
      'U1',
      expect.anything(),
    );
  });

  it('falls back to a direct message on a service whose adapter has no native ephemeral', async () => {
    // Discord's adapter implements no `postEphemeral`; the SDK's documented
    // fallback is a DM, which still satisfies "only that user sees it".
    const adapter = adapterMock();
    const openDM = adapter.openDM;
    Object.defineProperty(adapter, 'postEphemeral', {
      value: undefined,
      configurable: true,
    });
    openDM.mockResolvedValue('discord:G1:DM1');
    adapter.postMessage.mockResolvedValue({
      id: 'dm-1',
      raw: {},
      threadId: 'discord:G1:DM1',
    });

    const outcome = await postEphemeral(
      contextOf(adapter),
      channelOf('discord', 'discord:G1:C1'),
      { ...user, platform: 'discord' },
      MARKDOWN,
    );

    expect(outcome).toEqual({ ok: true, messageId: 'dm-1' });
    expect(openDM).toHaveBeenCalledWith('U1');
  });

  it('reports a failure as a PostOutcome instead of throwing', async () => {
    const adapter = adapterMock();
    adapter.postEphemeral.mockRejectedValue(new Error('boom'));

    const outcome = await postEphemeral(
      contextOf(adapter),
      channelOf('slack', 'slack:C123'),
      user,
      MARKDOWN,
    );

    expect(outcome).toEqual({
      ok: false,
      reason: 'platform-error',
      detail: 'boom',
    });
  });
});

describe('replace', () => {
  it('edits the existing message in place rather than posting a second one', async () => {
    const adapter = realAdapters.slack;
    const edit = vi
      .spyOn(adapter, 'editMessage')
      .mockResolvedValue({ id: 'posted-1', raw: {}, threadId: 'slack:C123:' });
    // `postMessage` is the only posting entry point declared as required on
    // `Adapter`; combined with a single `editMessage` call it is enough to show
    // the message was edited rather than re-posted.
    const postSpy = vi.spyOn(adapter, 'postMessage');

    const target: MessageRef = {
      channel: channelOf('slack', realChannelIds.slack),
      messageId: 'posted-1',
    };
    const outcome = await replace(contextOf(adapter), target, MARKDOWN);

    expect(outcome).toEqual({ ok: true, messageId: 'posted-1' });
    expect(postSpy).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledTimes(1);
    const [threadId, messageId] = edit.mock.calls[0] ?? [];
    expect(messageId).toBe('posted-1');
    expect(adapter.channelIdFromThreadId(String(threadId))).toBe(
      realChannelIds.slack,
    );

    edit.mockRestore();
    postSpy.mockRestore();
  });

  it('reports a failure as a PostOutcome instead of throwing', async () => {
    const adapter = adapterMock();
    adapter.editMessage.mockRejectedValue(new Error('message_not_found'));

    const outcome = await replace(
      contextOf(adapter),
      { channel: channelOf('discord', 'discord:G1:C1'), messageId: 'm1' },
      MARKDOWN,
    );

    expect(outcome).toEqual({
      ok: false,
      reason: 'platform-error',
      detail: 'message_not_found',
    });
  });
});

describe('attachPreview', () => {
  it('posts the preview alongside the message it describes, not as an unrelated channel post', async () => {
    const adapter = realAdapters.slack;
    const postMessage = vi.spyOn(adapter, 'postMessage').mockResolvedValue({
      id: 'preview-1',
      raw: {},
      threadId: 'slack:C123:ts',
    });

    const target: MessageRef = {
      channel: channelOf('slack', realChannelIds.slack),
      messageId: '1700000000.000100',
    };
    const outcome = await attachPreview(contextOf(adapter), target, MARKDOWN);

    expect(outcome).toEqual({ ok: true, messageId: 'preview-1' });
    const [threadId] = postMessage.mock.calls[0] ?? [];
    expect(threadId).toBe(
      channelThreadId(adapter, 'slack', realChannelIds.slack, target.messageId),
    );
    expect(threadId).not.toBe(
      channelThreadId(adapter, 'slack', realChannelIds.slack, null),
    );

    postMessage.mockRestore();
  });

  it('reports a failure as a PostOutcome instead of throwing', async () => {
    const adapter = realAdapters.slack;
    const postMessage = vi.spyOn(adapter, 'postMessage');
    postMessage.mockRejectedValue(new Error('nope'));

    const outcome = await attachPreview(
      contextOf(adapter),
      { channel: channelOf('slack', realChannelIds.slack), messageId: 'm1' },
      MARKDOWN,
    );

    expect(outcome).toEqual({
      ok: false,
      reason: 'platform-error',
      detail: 'nope',
    });

    postMessage.mockRestore();
  });
});
