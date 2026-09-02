// The single declared place for what each of the 4 chat services can do
// ("プラットフォーム能力表" -- design.md's "唯一の宣言箇所"). No other file
// in this app may branch on `platform === 'slack'` etc. for a capability
// question; it reads this table instead.
//
// Two other axes live in this same file because design.md places them
// "next to" the capability table, but they are declared as SEPARATE data
// structures from `CAPABILITY_TABLE` -- design.md is explicit that mixing
// them in would be wrong, since their "true" means the opposite of a
// capability's "true":
// - `CONNECTION_UNIT_TABLE`: how many persistent connections a service
//   needs and what its distributed-lock key looks like. This has nothing to
//   do with what the service can *do*.
// - `REQUIRES_INBOUND_REACHABILITY`: whether this proxy must accept an
//   inbound connection from the service. `true` here means "needs an open
//   inbound hole", the opposite polarity of `supports()` returning `true`
//   ("this platform is capable") -- folding it into `CAPABILITY_TABLE` would
//   silently invert that meaning for whoever reads it next to a capability
//   row.
import type { CapabilityLevel, PlatformName } from '@growi/chat';

/**
 * Every capability row design.md's プラットフォーム能力表 declares.
 * `CAPABILITY_TABLE` below has one entry per member of this union --
 * completeness across the 4 services for each of these is what
 * `platform-capabilities.spec.ts` checks without hardcoding a count.
 */
export type CapabilityName =
  | 'ephemeralMessage'
  | 'slashCommand'
  | 'mention'
  | 'modal'
  | 'interactiveActions'
  | 'card'
  | 'linkPreview'
  | 'fetchMessages'
  | 'plainReply';

type CapabilityRow = Readonly<Record<PlatformName, CapabilityLevel>>;

/**
 * design.md's プラットフォーム能力表, transcribed verbatim: ○ -> `full`,
 * △ -> `degraded`, × -> `none`, 要確認 -> `unverified`. See the Revalidation
 * Triggers section for when `plainReply`'s `unverified` rows are expected
 * to change.
 */
export const CAPABILITY_TABLE: Readonly<Record<CapabilityName, CapabilityRow>> =
  {
    ephemeralMessage: {
      slack: 'full',
      discord: 'full',
      teams: 'full',
      mattermost: 'full',
    },
    slashCommand: {
      slack: 'full',
      discord: 'full',
      teams: 'none',
      mattermost: 'none',
    },
    mention: {
      slack: 'full',
      discord: 'full',
      teams: 'full',
      mattermost: 'full',
    },
    modal: {
      slack: 'full',
      discord: 'none',
      teams: 'full',
      mattermost: 'none',
    },
    interactiveActions: {
      slack: 'full',
      discord: 'full',
      teams: 'full',
      mattermost: 'none',
    },
    card: {
      slack: 'full',
      discord: 'full',
      teams: 'full',
      mattermost: 'degraded',
    },
    linkPreview: {
      slack: 'full',
      discord: 'none',
      teams: 'none',
      mattermost: 'none',
    },
    fetchMessages: {
      slack: 'full',
      discord: 'full',
      teams: 'full',
      mattermost: 'full',
    },
    plainReply: {
      slack: 'unverified',
      discord: 'unverified',
      teams: 'unverified',
      mattermost: 'unverified',
    },
  };

/** The raw level, for a caller that needs to tell `degraded` apart from `none`. */
export function levelOf(
  capability: CapabilityName,
  platform: PlatformName,
): CapabilityLevel {
  return CAPABILITY_TABLE[capability][platform];
}

/**
 * `CapabilityLevel` (imported from `@growi/chat`) has 4 values: `full` is
 * the only one this function treats as usable. `degraded` (e.g.
 * Mattermost's `card`, which falls back to a plain markdown post) and
 * `unverified` (e.g. `plainReply` on every service -- not yet confirmed
 * against the real API) both mean "do not rely on this by default"; a
 * caller that specifically wants to detect "supported but degraded" (to
 * choose the documented fallback) reads `levelOf()` instead.
 *
 * The default/primary check. Returns `true` only when the level is `full`
 * -- `degraded` and `unverified` are both "do not rely on this", per
 * design.md: "`supports()` が `true` を返すのは `full` のときだけ".
 */
export function supports(
  capability: CapabilityName,
  platform: PlatformName,
): boolean {
  return levelOf(capability, platform) === 'full';
}

/**
 * How many persistent connections a service needs, and the distributed-lock
 * key `ConnectionManager` should use for it (design.md's 接続の単位 table).
 * Separate from `CAPABILITY_TABLE` -- see this file's header comment.
 */
export type ConnectionUnit =
  | { readonly kind: 'per-app'; readonly lockKey: string }
  | { readonly kind: 'per-installation'; readonly lockKeyPrefix: string }
  | { readonly kind: 'none' };

export const CONNECTION_UNIT_TABLE: Readonly<
  Record<PlatformName, ConnectionUnit>
> = {
  slack: { kind: 'per-app', lockKey: 'app:slack' },
  discord: { kind: 'per-app', lockKey: 'app:discord' },
  teams: { kind: 'none' },
  mattermost: { kind: 'per-installation', lockKeyPrefix: 'installation:' },
};

/**
 * Whether this proxy must accept an inbound connection from the service
 * (design.md's 制約 row). Only Teams is `true` -- Bot Framework POSTs to
 * this proxy rather than the proxy connecting out. Separate from
 * `CAPABILITY_TABLE` -- see this file's header comment for why `true` here
 * is not "more capable".
 */
export const REQUIRES_INBOUND_REACHABILITY: Readonly<
  Record<PlatformName, boolean>
> = {
  slack: false,
  discord: false,
  teams: true,
  mattermost: false,
};
