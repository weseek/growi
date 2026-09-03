// Task 4.1: 「どちらの入り口から来ても同じ形になる」. This file's central
// claim (`normalize` on a `mention` and a `slash-command` carrying the same
// content produces the identical `Invocation`) is asserted as one direct
// `toEqual` between the two outputs, not as two separate assertions against
// a hand-written expectation -- so a change that keeps both individually
// "plausible" but drifts them apart from each other still fails this test.
import type { ChannelRef, ChatAccountRef } from '@growi/chat';

import type { InteractionRef } from '../types/index.js';
import { CommandInvocation } from './invocation.js';

const channel: ChannelRef = {
  platform: 'slack',
  channelId: 'C0001',
  channelName: 'general',
  isPrivate: false,
};

const actor: ChatAccountRef = {
  platform: 'slack',
  accountId: 'U0001',
  displayName: 'Alice Example',
};

const trigger: InteractionRef = { token: 'trigger-1' };

describe('CommandInvocation.normalize', () => {
  it('produces the identical Invocation for a mention and a slash command carrying the same content', () => {
    const fromMention = CommandInvocation.normalize({
      kind: 'mention',
      platform: 'slack',
      channel,
      actor,
      text: '@growi search foo',
      interaction: null,
    });

    const fromSlashCommand = CommandInvocation.normalize({
      kind: 'slash-command',
      platform: 'slack',
      channel,
      actor,
      command: 'search',
      text: 'foo',
      interaction: null,
    });

    expect(fromMention).toEqual(fromSlashCommand);
    expect(fromMention).toEqual({
      platform: 'slack',
      channel,
      actor,
      commandName: 'search',
      argsText: 'foo',
      interaction: null,
    });
  });

  it('strips the mention address token before splitting the command name off the remaining text', () => {
    const result = CommandInvocation.normalize({
      kind: 'mention',
      platform: 'slack',
      channel,
      actor,
      text: '@growi keep https://growi.example.com/page',
      interaction: null,
    });

    expect(result.commandName).toBe('keep');
    expect(result.argsText).toBe('https://growi.example.com/page');
  });

  it('produces an empty commandName and argsText for a mention with no command word, without throwing', () => {
    const result = CommandInvocation.normalize({
      kind: 'mention',
      platform: 'slack',
      channel,
      actor,
      text: '@growi',
      interaction: null,
    });

    expect(result.commandName).toBe('');
    expect(result.argsText).toBe('');
  });

  it('carries the interaction handle through unchanged for a slash command', () => {
    const result = CommandInvocation.normalize({
      kind: 'slash-command',
      platform: 'slack',
      channel,
      actor,
      command: 'add-growi',
      text: '',
      interaction: trigger,
    });

    expect(result.interaction).toBe(trigger);
    expect(result.commandName).toBe('add-growi');
    expect(result.argsText).toBe('');
  });
});
