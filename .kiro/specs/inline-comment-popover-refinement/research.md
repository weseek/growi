# Research & Design Decisions Template

## Summary
- **Feature**: `inline-comment-popover-refinement`
- **Discovery Scope**: Extension (existing, already-shipped `InlineCommentPreviewPopover` / `InlineCommentBodyInteraction`)
- **Key Findings**:
  - `useHighlightHitTest` only ever reports "what is under the pointer right now"; it has no hide-on-leave concept at all. The disappear-before-arrival bug is entirely a consequence of `InlineCommentBodyInteraction`'s own `displayedId = pinnedId ?? effectiveHit?.commentId ?? null` reacting synchronously to `hit` becoming `null` the instant the pointer leaves the highlight's rects — before it ever reaches the popover's own (DOM-disjoint, portaled) rect.
  - `pinnedId` (click-driven "stay open until explicit close") already exists as a fully separate concept from the reactive hover value. The fix is a natural extension of this existing mechanism — promote a hover-shown popover into the same `pinnedId` state the moment the pointer actually reaches it — rather than a new independent mechanism.
  - Resolve is not a new feature: `useSWRxInlineComments().resolve(id, resolved)` and the exact badge/button convention already exist in `InlineCommentItem.tsx`. No schema, DTO, route, or permission change is needed — only a second UI surface for the same existing capability.
  - `resolveInlineComment` (the store's `resolve`) is already destructured in `PageView.tsx` (line ~233) and only needs to be threaded one level further, as a new prop, into `<InlineCommentBodyInteraction>` (currently only `createReply` is threaded that way) and from there into `InlineCommentPreviewPopover`.
  - The popover currently renders no quote/anchor context at all (`comment.anchor.quote` is never read here) — Requirement 3.3 is a genuinely new capability, not a re-styling of something already shown.

## Research Log

### Hover-hit lifecycle and where the bug actually lives
- **Context**: Confirm precisely why hovering a highlight and moving toward the popover closes it before arrival.
- **Sources Consulted**: `use-highlight-hit-test.ts` (full read), `InlineCommentBodyInteraction.tsx` (full read).
- **Findings**:
  - `useHighlightHitTest` hit-tests `pointermove`/`click` against the highlight's own `Range.getClientRects()` only; the popover (portaled to `document.body`) is not one of `ranges` and is invisible to the hook.
  - `applyHit` sets `hit` back to `null` on the very next `pointermove` whose coordinates miss every highlight rect — there is no debounce, no grace zone, and no listener on the popover itself.
  - `InlineCommentBodyInteraction` derives `displayedId = pinnedId ?? effectiveHit?.commentId ?? null` — while unpinned, this recomputes reactively on every `hit` change, so the popover disappears the instant `hit` goes `null`, mid-transit toward it.
  - `pinnedId` is already the mechanism that makes a click-opened popover immune to this (a hover elsewhere does nothing once pinned) — see the file's own doc comment, "a hover elsewhere does nothing while a popover is pinned open".
- **Implications**: The fix does not touch `use-highlight-hit-test.ts` at all. It extends `InlineCommentBodyInteraction`'s existing pin/hover interpretation layer with (a) a debounce on the hover-driven show/hide transitions and (b) a promotion path that turns a hover-shown popover into a pinned one the moment the pointer reaches the popover's own DOM — reusing `pinnedId`, not inventing a second "locked" state.

### Resolve: existing capability, new UI surface only
- **Context**: Confirm resolve is not new plumbing.
- **Sources Consulted**: `client/stores/inline-comment.ts`, `InlineCommentItem.tsx`, `interfaces/index.ts`, `interfaces/dto/resolve-inline-comment.ts`, `PageView.tsx`.
- **Findings**:
  - `useSWRxInlineComments(pageId).resolve(id, resolved): Promise<IInlineComment>` already exists, already revalidates the page's SWR list on success — the same list `InlineCommentBodyInteraction`'s `inlineComments` prop is built from, so a resolve triggered from the popover is picked up by the bottom-of-page list (`InlineCommentItem`) through the ordinary SWR revalidation path, with no extra plumbing.
  - `isResolved` is derived as `comment.resolvedAt != null` (never a separate boolean/enum) — `InlineCommentWithReplies` already carries this field, no type change needed.
  - The existing toggle button carries no permission-gating wrapper (e.g. no `NotAvailableIfReadOnlyUserNotAllowedToComment`); the backend route enforces permission and a rejected call surfaces as a caught error. The popover's own resolve control should follow the identical, ungated pattern rather than inventing a new client-side permission check.
  - `PageView.tsx` already holds `resolveInlineComment` (destructured from the same `useSWRxInlineComments` call the page's `inlineComments`/`createInlineCommentReplyText` come from) — passing it into `<InlineCommentBodyInteraction resolve={resolveInlineComment} .../>` is a one-line addition, not a new fetch site (preserves Requirement 13.8 of the upstream spec: the share-link view never fetches inline comments — `InlineCommentBodyInteraction` is not even rendered there).
- **Implications**: No DTO, route, or store change. The only new wiring is one prop threaded through two existing components.

### Layout: reuse `CommentCard`'s extension slots rather than a bespoke header
- **Context**: Decide whether "Option B" (the approved mockup direction) requires replacing `CommentCard` or can be achieved through its existing `headerEnd`/`footer` slots.
- **Sources Consulted**: `CommentCard.tsx` (full read), `InlineCommentItem.tsx` (existing `headerEnd` usage for its own resolve toggle), the approved mockup (Option B).
- **Findings**: `CommentCard` already renders avatar + name + timestamp (Requirements 3.1, 3.2) and already exposes `headerEnd`/`footer` slots — `InlineCommentItem.tsx` already places its resolve badge+button in exactly `headerEnd`. The popover can reach the same "structured thread" visual result (resolve control separated from the name row, a divider before the reply section) by supplying `headerEnd` (resolve toggle) and `footer` (a divider + reply composer), without diverging from the shared component.
- **Implications**: `CommentCard` itself needs no change. The popover keeps using it for the origin comment and each reply, exactly as today — only the slot contents and the composer's own markup change.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Extend `pinnedId` with a hover-promotion path (chosen) | Debounce hover show/hide in `InlineCommentBodyInteraction`; promote to the existing `pinnedId` state on popover pointer-enter | Reuses an already-correct, already-tested close mechanism; no new "locked" state to keep in sync with `pinnedId` | Requires careful timer cleanup on unmount/id-change | Chosen |
| A second independent "locked" boolean alongside `pinnedId` | Track hover-lock separately from click-pin | Keeps the two triggers conceptually separate | Two states that must both gate "does this auto-close", doubling the surface for a "which one wins" bug | Rejected — no behavioral difference from the chosen option once locked, only added bookkeeping |
| Hover-intent library (e.g., a generic "hoverable popover" utility) | Adopt an off-the-shelf hook | Battle-tested timing edge cases | No existing dependency in this codebase provides this; the actual timing logic needed here is ~2 `setTimeout` calls plus one pointer-enter promotion, far smaller than a general-purpose library's surface | Rejected — build vs. adopt favors building; adopting would add a dependency for a few lines of logic already the right shape for this codebase's existing `pinnedId` pattern |

## Design Decisions

### Decision: Reuse `pinnedId`, don't add a second "locked" state
- **Context**: How should "mouse has entered the popover, stop auto-closing" be represented alongside the existing click-driven `pinnedId`?
- **Alternatives Considered**:
  1. A new `isLockedByHover: boolean` state, checked in addition to `pinnedId` everywhere `pinnedId` is currently checked.
  2. Promote directly into `pinnedId` on popover pointer-enter, so exactly one state governs "stays open until explicit close" regardless of how it got there.
- **Selected Approach**: (2). `handlePointerEnterPopover` sets `pinnedId = hoverPreviewId` (clearing `hoverPreviewId`) the first time the pointer enters the popover while it is showing via hover and not yet pinned.
- **Rationale**: `pinnedId`'s existing semantics ("shown regardless of what the hook currently reports, cleared only by the popover's own close mechanism") are exactly what Requirement 1.4/1.5 need. Reusing it means every existing invariant about `pinnedId` (a new click hit always redirects it; `suppressedHit`/`handleClose` clear it) keeps working unmodified for the promoted case too.
- **Trade-offs**: None identified — this is a strict simplification over a two-state design.
- **Follow-up**: None.

### Decision: Debounce timing constants
- **Context**: Requirement 1.1/1.2 require "a short delay" on both hover-show and hover-hide, without a numeric value in requirements (deliberately left as a UX-observable "some delay", not a design contract with the user).
- **Alternatives Considered**:
  1. Match a general-purpose "hover card" convention (e.g. ~700ms open / ~300ms close), tuned for content the user has not yet seen.
  2. Shorter delays tuned for re-confirming an already-familiar UI element (a highlight the user already knows shows a comment).
- **Selected Approach**: (2) — `HOVER_SHOW_DELAY_MS = 150`, `HOVER_HIDE_DELAY_MS = 250`, defined as local constants in `InlineCommentBodyInteraction.tsx`.
- **Rationale**: The show delay only needs to be long enough to avoid flicker while the pointer passes over a highlight without stopping (e.g. scanning while reading); the hide delay only needs to comfortably cover the transit time from a highlight to an adjacent popover. Both are short because, unlike a first-time tooltip, this is a returning UI affordance the user is already trying to reach.
- **Trade-offs**: A fixed value cannot be tuned per-device without becoming a new configuration surface; not justified by the current requirement.
- **Follow-up**: None — revisit only if real usage reports the delay feels wrong in either direction.

### Decision: Duplicate the resolve badge/button markup rather than extracting a shared component
- **Context**: `InlineCommentItem.tsx` and the popover will now render the literal same badge+button pattern (same classNames, same translation keys, same `resolvedAt != null` derivation).
- **Alternatives Considered**:
  1. Extract a shared presentational `ResolveToggle` component, used by both `InlineCommentItem.tsx` and `InlineCommentPreviewPopover.tsx`.
  2. Duplicate the ~10-line badge+button block directly in the popover, matching the existing convention by hand.
- **Selected Approach**: (2).
- **Rationale**: The requirements' own Boundary Context excludes changing `InlineCommentItem.tsx`'s "表示・切り替えロジック自体" — extracting a shared component would still touch that file (replacing its inline markup with the new component), widening this amend spec's diff into a file explicitly declared out of scope. The duplicated block is small, and the two call sites already have different surrounding layouts (`headerEnd` slot vs. inline in the popover body) with different error-placement needs, so a shared component would need parameterization for no real reuse benefit yet.
- **Trade-offs**: A future change to the resolve toggle's look must be applied in two places. Acceptable given the current size and the explicit scope boundary.
- **Follow-up**: If a third consumer of this pattern appears, extract a shared component at that point.

## Risks & Mitigations
- Risk: A timer-based state machine can leak timers across rapid hover/id changes or unmount. — Mitigation: All `setTimeout` handles are cleared in the same effect's cleanup and whenever `hit`/`pinnedId` change, following the existing cleanup pattern the file already uses for its `document` listeners.
- Risk: Promoting a hover-shown popover into `pinnedId` could interact unexpectedly with the existing `suppressedHit` close-tracking mechanism. — Mitigation: `handleClose` (unchanged in shape) already clears `pinnedId` and records `suppressedHit`; the promotion path only ever *sets* `pinnedId`, so the existing close path fully covers the promoted case with no new branch.
- Risk: Adding a new `resolve` prop to `InlineCommentBodyInteraction`/`InlineCommentPreviewPopover` could be missed at a call site other than `PageView.tsx`. — Mitigation: grep confirmed `InlineCommentBodyInteraction` has exactly one render call site (`PageView.tsx`).

## References
- `.kiro/specs/inline-comment/requirements.md` (Requirement 15, Requirement 4) — amend target.
- `.kiro/specs/inline-comment/design.md` — traceability table entry for `InlineCommentBodyInteraction` / `InlineCommentPreviewPopover`.
