import type { PlatformName } from '@growi/chat';
import { describe, expect, it } from 'vitest';

import {
  CAPABILITY_TABLE,
  CONNECTION_UNIT_TABLE,
  levelOf,
  REQUIRES_INBOUND_REACHABILITY,
  supports,
} from './platform-capabilities.js';

// design.md's プラットフォーム能力表 lists exactly these 4 services -- not
// re-derived from CAPABILITY_TABLE's own keys, so a bug that drops a service
// from the table's declaration cannot also hide from this list.
const ALL_PLATFORMS: readonly PlatformName[] = [
  'slack',
  'discord',
  'teams',
  'mattermost',
];

describe('CAPABILITY_TABLE completeness', () => {
  it('has a defined CapabilityLevel for every (capability, service) pair, for every declared capability -- without hardcoding the capability count', () => {
    // Deriving the capability list from the table itself (not a literal
    // count) is the point of task 1.6's acceptance criterion: adding a 10th
    // capability to CAPABILITY_TABLE must make this test cover it
    // automatically, with no edit to this file.
    const capabilityNames = Object.keys(CAPABILITY_TABLE);
    expect(capabilityNames.length).toBeGreaterThan(0);

    for (const capabilityName of capabilityNames) {
      const row =
        CAPABILITY_TABLE[capabilityName as keyof typeof CAPABILITY_TABLE];
      for (const platform of ALL_PLATFORMS) {
        expect(row[platform]).toBeDefined();
        // This literal mirrors `@growi/chat`'s `CapabilityLevel` union
        // ('full' | 'degraded' | 'none' | 'unverified'). It is a type-only
        // union with no runtime array exported to iterate instead -- if
        // `@growi/chat` ever adds/removes a level, update this list to match.
        expect(['full', 'degraded', 'none', 'unverified']).toContain(
          row[platform],
        );
      }
    }
  });
});

describe('supports()', () => {
  it('returns true only when the level is full', () => {
    expect(supports('ephemeralMessage', 'slack')).toBe(true);
    expect(levelOf('ephemeralMessage', 'slack')).toBe('full');
  });

  it('returns false for a degraded capability (Mattermost card)', () => {
    expect(levelOf('card', 'mattermost')).toBe('degraded');
    expect(supports('card', 'mattermost')).toBe(false);
  });

  it('returns false for a none capability (Discord modal)', () => {
    expect(levelOf('modal', 'discord')).toBe('none');
    expect(supports('modal', 'discord')).toBe(false);
  });

  it('returns false for an unverified capability (plainReply, every service)', () => {
    for (const platform of ALL_PLATFORMS) {
      expect(levelOf('plainReply', platform)).toBe('unverified');
      expect(supports('plainReply', platform)).toBe(false);
    }
  });
});

describe('design.md-declared capability values (spot checks)', () => {
  it('matches the ○/△/×/要確認 table for a representative sample', () => {
    expect(levelOf('slashCommand', 'slack')).toBe('full');
    expect(levelOf('slashCommand', 'teams')).toBe('none');
    expect(levelOf('modal', 'discord')).toBe('none');
    expect(levelOf('modal', 'teams')).toBe('full');
    expect(levelOf('interactiveActions', 'mattermost')).toBe('none');
    expect(levelOf('linkPreview', 'slack')).toBe('full');
    expect(levelOf('linkPreview', 'discord')).toBe('none');
    expect(levelOf('linkPreview', 'teams')).toBe('none');
    expect(levelOf('linkPreview', 'mattermost')).toBe('none');
    expect(levelOf('fetchMessages', 'teams')).toBe('full');
  });
});

describe('connection-unit axis (separate from the capability table)', () => {
  it('gives Slack and Discord a per-app connection', () => {
    expect(CONNECTION_UNIT_TABLE.slack).toEqual({
      kind: 'per-app',
      lockKey: 'app:slack',
    });
    expect(CONNECTION_UNIT_TABLE.discord).toEqual({
      kind: 'per-app',
      lockKey: 'app:discord',
    });
  });

  it('gives Teams no persistent connection', () => {
    expect(CONNECTION_UNIT_TABLE.teams).toEqual({ kind: 'none' });
  });

  it('gives Mattermost a per-installation connection', () => {
    expect(CONNECTION_UNIT_TABLE.mattermost).toEqual({
      kind: 'per-installation',
      lockKeyPrefix: 'installation:',
    });
  });
});

describe('inbound-reachability axis (separate from the capability table)', () => {
  it('requires inbound reachability only for Teams', () => {
    expect(REQUIRES_INBOUND_REACHABILITY).toEqual({
      slack: false,
      discord: false,
      teams: true,
      mattermost: false,
    });
  });
});
