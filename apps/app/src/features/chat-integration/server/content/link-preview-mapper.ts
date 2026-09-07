// Turning a page resolved from a pasted GROWI URL into `@growi/chat`'s
// `link-preview` response (design.md `LinkPreviewMapper` -- Requirements
// 6.2, 6.3).
//
// Requirement 6 draws exactly two states, both independent of WHO pasted the
// link or who else is in the channel:
//   6.2 -- the page is one anyone may read: include the body excerpt,
//          updated-at and comment count.
//   6.3 -- the page is not one anyone may read: include nothing but the path.
// Neither acceptance criterion mentions the individual requester's own view
// permission, unlike Requirement 3 (search, 3.6/3.7) which explicitly does.
// That is why this mapper takes no `user`/`userGroups` -- there is no
// actor-shaped question for it to answer, and adding one would invent a rule
// Requirement 6 does not state (`COMMAND_TRAITS.linkPreview.targeting` is
// `'url-matched'`, not `'single'`: the URL, not an actor, decides the
// target).
//
// design.md's "PublicPageFilter を呼ぶ側も、閉じた GROWI での扱いを決める" table adds
// a second, GROWI-wide gate on top of 6.2/6.3's page-level one: in a closed
// GROWI (`aclService.isGuestAllowedToRead()` false), link expansion is
// path-only EVEN FOR a GRANT_PUBLIC page -- "本文の冒頭・更新日時・コメント数を出さない
// ... URL を貼った本人が中身を知っていても、チャンネルの全員がそうとは限らない" does not carve
// out an exception for a publicly-graned page. So the full summary requires
// BOTH `isPubliclyReadablePage(page)` AND `isGuestAllowedToRead` -- either one
// being false collapses to path-only.
//
// `excerpt` truncation length: design.md pins Gen 1's 2000-character body
// truncation (`server/util/slack.js`, referenced at design.md line 415) only
// for `NotificationContent` (task 4.5, not yet implemented), not explicitly
// for this mapper. No length is stated for link-preview specifically, so the
// same 2000-character convention is reused here by analogy rather than by
// direct citation -- flagged in this task's status report as this
// implementer's own choice, not a design.md requirement.

import {
  isPubliclyReadablePage,
  type PublicPageFilterSource,
} from './public-page-filter';

const EXCERPT_LENGTH = 2000;

/** The fields this mapper reads off a resolved page. */
export interface LinkPreviewPageSource extends PublicPageFilterSource {
  readonly path: string;
  /** Full markdown body; truncated to `EXCERPT_LENGTH` characters here. */
  readonly body: string;
  readonly updatedAt: Date;
  readonly commentCount: number;
}

/** `@growi/chat`'s `link-preview` response, minus its `kind` discriminant. */
export interface LinkPreviewResult {
  readonly path: string;
  readonly restricted: boolean;
  readonly excerpt?: string;
  readonly updatedAt?: string;
  readonly commentCount?: number;
}

/**
 * Builds the link-preview summary for `page`.
 *
 * `isGuestAllowedToRead` is caller-supplied (`crowi.aclService.isGuestAllowedToRead()`),
 * same pattern as `resolveActor`'s `resolveReadDenial` -- keeping the lookup
 * out of this module leaves it pure and testable.
 */
export const buildLinkPreview = (
  page: LinkPreviewPageSource,
  isGuestAllowedToRead: boolean,
): LinkPreviewResult => {
  const isFullSummaryAllowed =
    isPubliclyReadablePage(page) && isGuestAllowedToRead;

  if (!isFullSummaryAllowed) {
    return { path: page.path, restricted: true };
  }

  return {
    path: page.path,
    restricted: false,
    excerpt: page.body.slice(0, EXCERPT_LENGTH),
    updatedAt: page.updatedAt.toISOString(),
    commentCount: page.commentCount,
  };
};
