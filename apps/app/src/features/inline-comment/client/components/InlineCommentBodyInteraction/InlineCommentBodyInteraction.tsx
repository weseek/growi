/**
 * Combines the hit-test hook (task 3.1, `use-highlight-hit-test.ts`) with the
 * content-preview popover (task 3.2, `InlineCommentPreviewPopover.tsx`) and
 * decides, on every render, which comment id (if any) should have its
 * popover open (design.md 決定2, requirements.md Requirement 2), plus the
 * hover show/hide delay and pointer-enter-lock timing this spec
 * (inline-comment-popover-refinement) adds on top (design.md's "Hover
 * show/hide/lock sequence", requirements.md Requirement 1).
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
 *
 * A hover-sourced hit is not shown immediately: it is only promoted into
 * `hoverPreviewId` once it has been the current hit continuously for
 * `HOVER_SHOW_DELAY_MS`, and once shown, it survives the hit clearing to
 * `null` for `HOVER_HIDE_DELAY_MS` (research.md's "Debounce timing
 * constants" decision) -- this is what lets the pointer travel from the
 * highlight to the (DOM-disjoint, portaled) popover without the popover
 * disappearing mid-transit. `handlePointerEnterPopover` (called once the
 * popover itself reports the pointer has actually arrived) cancels that
 * grace-period timer and promotes `hoverPreviewId` into the same `pinnedId`
 * state a click uses (research.md's "Reuse pinnedId" decision), so from
 * that moment on the popover behaves exactly like a click-pinned one and is
 * closed only by the existing `handleClose` path.
 */
import {
  type FC,
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

// research.md's "Debounce timing constants" decision: short delays tuned for
// re-confirming an already-familiar UI element (a highlight the user already
// knows shows a comment), not a first-time tooltip.
const HOVER_SHOW_DELAY_MS = 150;
const HOVER_HIDE_DELAY_MS = 250;

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
  // The hover-sourced id currently shown, once it has survived the show
  // delay -- see the file doc comment. `null` while nothing hover-shown is
  // displayed. Superseded entirely by `pinnedId` once set (see `displayedId`
  // below and `handlePointerEnterPopover`'s promotion).
  const [hoverPreviewId, setHoverPreviewId] = useState<string | null>(null);
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

  // Pending debounce timers for the hover show/hide transitions. Refs, not
  // state, because starting/cancelling a timer is not itself something the
  // popover's rendered output depends on -- only `hoverPreviewId` is.
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setHoverPreviewId(null);
      setSuppressedHit(null);
    }
  }, [hit]);

  const isHitSuppressed =
    suppressedHit != null &&
    hit != null &&
    suppressedHit.commentId === hit.commentId &&
    suppressedHit.source === hit.source;
  const effectiveHit = isHitSuppressed ? null : hit;

  // Debounced show/hide for hover-sourced hits (Requirement 1.1, 1.2). A click
  // hit is handled entirely by the effect above -- while a popover is pinned,
  // hover hits are ignored outright (existing invariant, Requirement 1.6/the
  // file doc comment's "a hover elsewhere does nothing" precedence).
  //
  // The cleanup function clears both timers whenever this effect is about to
  // re-run (a genuinely new `effectiveHit`/`pinnedId`/`hoverPreviewId`) and on
  // unmount, so no timer ever fires against a stale hit.
  useEffect(() => {
    if (pinnedId != null) {
      return undefined;
    }

    if (effectiveHit?.source === 'hover') {
      // Reaching the highlight again (same or different id) always cancels
      // a pending hide -- Requirement 1.3's "reached before the grace period
      // elapses" case, generalized to "a new hover hit arrived at all".
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (hoverPreviewId !== effectiveHit.commentId) {
        if (showTimerRef.current != null) {
          clearTimeout(showTimerRef.current);
        }
        showTimerRef.current = setTimeout(() => {
          setHoverPreviewId(effectiveHit.commentId);
          showTimerRef.current = null;
        }, HOVER_SHOW_DELAY_MS);
      }
    } else {
      // The hit cleared (or is a suppressed/click hit handled elsewhere): a
      // hover hit that had not yet survived its show delay must not appear
      // at all, so cancel any pending show. If something is already shown
      // via hover, keep it for the hide grace period (Requirement 1.2)
      // before clearing it.
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (hoverPreviewId != null) {
        hideTimerRef.current = setTimeout(() => {
          setHoverPreviewId(null);
          hideTimerRef.current = null;
        }, HOVER_HIDE_DELAY_MS);
      }
    }

    return () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [effectiveHit, pinnedId, hoverPreviewId]);

  // Called once the popover itself reports the pointer has entered its own
  // DOM (Requirement 1.3, 1.4). Cancels the pending hide (there is nothing
  // left to hide-timeout since the pointer has arrived) and promotes the
  // hover-shown id into `pinnedId`, reusing the existing pin mechanism
  // (research.md's "Reuse pinnedId, don't add a second locked state"
  // decision) -- a no-op if a click has already pinned a popover in the
  // meantime (Requirement 1.4's "no auto-close" is then already satisfied by
  // the pin itself).
  const handlePointerEnterPopover = useCallback((): void => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (pinnedId != null) {
      return;
    }

    setPinnedId(hoverPreviewId);
    setHoverPreviewId(null);
  }, [pinnedId, hoverPreviewId]);

  const handleClose = (): void => {
    setPinnedId(null);
    setHoverPreviewId(null);
    setSuppressedHit(hit);
  };

  // A pin, once set, takes precedence over everything else (a hover
  // elsewhere does nothing while a popover is pinned open). With no pin, the
  // debounced hover-shown id (if any) drives display.
  const displayedId = pinnedId ?? hoverPreviewId ?? null;

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
      // @ts-expect-error: `onPointerEnter` is added to
      // `InlineCommentPreviewPopoverProps` by a later task in this same spec
      // (design.md's "Modified Files" entry for InlineCommentPreviewPopover.tsx)
      // -- out of this task's boundary. Wired here already so
      // `handlePointerEnterPopover`'s promotion logic is exercised end-to-end
      // the moment that prop lands; remove this directive once it does.
      onPointerEnter={handlePointerEnterPopover}
    />
  );
};
