/**
 * Combines the hit-test hook (task 3.1, `use-highlight-hit-test.ts`) with the
 * content-preview popover (task 3.2, `InlineCommentPreviewPopover.tsx`) and
 * decides, on every render, which comment id (if any) should have its
 * popover open (design.md 決定2, requirements.md Requirement 2).
 *
 * `useHighlightHitTest` reports only the *current* hit and does not latch a
 * click-selected id itself (see tasks.md's Implementation Notes for task
 * 3.1): once the pointer leaves the highlight after a click, the next
 * `pointermove` clears the hook's own value back to `null`. This component
 * is the one responsible for "pinning" a click-opened popover open despite
 * that -- `pinnedId` below persists across the hook clearing its hit, and is
 * cleared only by the popover's own close mechanism (outside click / close
 * button, AC 2.4), never merely because a hover hit stopped being reported.
 *
 * Precedence while a popover is pinned open: a hover elsewhere does nothing
 * -- `pinnedId` (once set) is shown regardless of what the hook currently
 * reports, exactly like a modal taking precedence over a tooltip. A *new*
 * click hit (on the same or a different highlight) always updates the pin,
 * since a click as the more deliberate gesture is allowed to redirect an
 * already-open popover to a new target.
 */
import { type FC, type JSX, useEffect, useState } from 'react';

import type { RendererOptions } from '~/interfaces/renderer-options';

import type {
  InlineCommentWithReplies,
  ResolvedRange,
} from '../../../interfaces';
import { rangesById } from '../../services/resolved-range';
import { InlineCommentPreviewPopover } from './InlineCommentPreviewPopover';
import type { HighlightHit } from './use-highlight-hit-test';
import { useHighlightHitTest } from './use-highlight-hit-test';

type InlineCommentBodyInteractionProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  resolvedRanges: ReadonlyMap<string, ResolvedRange>;
  inlineComments: InlineCommentWithReplies[];
  createReply: (parentId: string, comment: string) => Promise<unknown>;
  /**
   * Undefined while the caller's renderer options are still loading --
   * forwarded as-is to `InlineCommentPreviewPopover`, which falls back to
   * plain text rendering in that case.
   */
  rendererOptions: RendererOptions | undefined;
};

const EMPTY_RANGES: ReadonlyMap<string, Range> = new Map();

export const InlineCommentBodyInteraction: FC<
  InlineCommentBodyInteractionProps
> = (props): JSX.Element | null => {
  const {
    containerRef,
    resolvedRanges,
    inlineComments,
    createReply,
    rendererOptions,
  } = props;

  // Rebuilt on every render from the container's current DOM, never cached
  // -- the same policy `resolved-range.ts` documents for its own callers
  // (design.md 決定3). The same map serves both `useHighlightHitTest` (which
  // only needs the structural `HitTestTarget` surface, `getClientRects()`)
  // and the popover lookup below (which needs the actual `Range`).
  const container = containerRef.current;
  const ranges: ReadonlyMap<string, Range> =
    container != null ? rangesById(container, resolvedRanges) : EMPTY_RANGES;

  const hit = useHighlightHitTest(containerRef, ranges);

  const [pinnedId, setPinnedId] = useState<string | null>(null);
  // The exact hit value that was showing when the popover's own close
  // mechanism last fired (AC 2.4). Needed because closing does not, by
  // itself, change what `useHighlightHitTest` reports -- most concretely,
  // its close button is portaled outside `containerRef`'s subtree, so the
  // click that triggers it is invisible to the hook's container-scoped
  // listeners and its hit value would otherwise stay exactly as it was,
  // causing the popover to reappear on the very next render. Suppression is
  // compared by value, not identity, and is cleared as soon as the hook
  // reports a genuinely different hit (a real subsequent interaction).
  const [suppressedHit, setSuppressedHit] = useState<HighlightHit | null>(null);

  // A click hit pins the popover open on that id, overriding whatever was
  // previously pinned, and lifts any prior suppression -- a new click is a
  // deliberate gesture that always reopens/redirects. Hover hits are
  // intentionally not observed here; pinning must only ever be driven by a
  // click/tap. This effect only re-runs when `hit`'s reference actually
  // changes, which `useHighlightHitTest` guarantees happens only when its
  // reported value genuinely differs from before.
  useEffect(() => {
    if (hit?.source === 'click') {
      setPinnedId(hit.commentId);
      setSuppressedHit(null);
    }
  }, [hit]);

  const handleClose = (): void => {
    setPinnedId(null);
    setSuppressedHit(hit);
  };

  const isHitSuppressed =
    suppressedHit != null &&
    hit != null &&
    suppressedHit.commentId === hit.commentId &&
    suppressedHit.source === hit.source;
  const effectiveHit = isHitSuppressed ? null : hit;

  // A pin, once set, takes precedence over the hook's live value entirely
  // (a hover elsewhere does nothing while a popover is pinned open). With no
  // pin, the hook's current (non-suppressed) hit drives display reactively.
  const displayedId = pinnedId ?? effectiveHit?.commentId ?? null;

  const comment =
    displayedId != null
      ? inlineComments.find((candidate) => candidate.id === displayedId)
      : undefined;
  // Requirement 2.6: a comment whose anchor failed to resolve is never
  // offered a popover. Structurally this lookup should always succeed --
  // useHighlightHitTest is only ever given ids that ARE in `ranges`, which
  // is itself built from `resolvedRanges` -- but the inline-comments list
  // can momentarily lag behind during a refetch, so this stays a defensive
  // guard rather than an assumed invariant.
  const range = displayedId != null ? ranges.get(displayedId) : undefined;

  if (comment == null || range == null) {
    return null;
  }

  return (
    <InlineCommentPreviewPopover
      comment={comment}
      range={range}
      rendererOptions={rendererOptions}
      createReply={createReply}
      onClose={handleClose}
    />
  );
};
