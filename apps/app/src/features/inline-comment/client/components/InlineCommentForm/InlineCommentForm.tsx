/**
 * Comment-creation form shown by `SelectionCapture` (task 4.2) once a text
 * selection has been captured (design.md's "作成フロー（起点コメント）" sequence:
 * SelectionCapture -> InlineCommentForm -> Store).
 *
 * The mention-aware editor assembly (CodeMirrorEditorComment +
 * useCodeMirrorEditorIsolated + mention extensions), submission, and error
 * display are owned by the shared `MentionAwareCommentInput`. This form owns
 * only what is specific to the create-form context: the quote (kept in the
 * DOM but visually hidden -- the target range is already highlighted in the
 * body, so a visible quote would duplicate it; the inline-comment Playwright
 * suite locates it to verify the right occurrence was captured, and it is
 * left in the accessible-name tree rather than removed from it entirely, so
 * a screen-reader user reaches it as passive context when tabbing through
 * the form), cancellation (Escape key or an outside click/mousedown -- there
 * is no visible Cancel button, matching the reference mockup), and the
 * `create()` call.
 */

import type { JSX } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { useSWRxInlineComments } from '../../stores/inline-comment';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';
import type { CapturedSelection } from '../SelectionCapture/use-text-selection';

type InlineCommentFormProps = {
  pageId: string;
  /** The revision the captured anchor was computed against (design.md's `anchorOriginRevisionId`). */
  anchorOriginRevisionId: string;
  /** The locked-in selection this form was opened for (SelectionCapture's task 2.3 output). */
  anchor: CapturedSelection;
  /** Called after a successful create (e.g. to close the form / clear the selection). */
  onSubmitted?: () => void;
  /** Called when the user cancels without submitting. */
  onCanceled?: () => void;
};

export const InlineCommentForm = (
  props: InlineCommentFormProps,
): JSX.Element => {
  const { pageId, anchorOriginRevisionId, anchor, onSubmitted, onCanceled } =
    props;

  const { create } = useSWRxInlineComments(pageId);

  // One create-form editor instance per page, mirroring CommentEditor's
  // GlobalCodeMirrorEditorKey.COMMENT_NEW reuse for all new top-level comments.
  const editorKey = useMemo(() => `inline_comment_new_${pageId}`, [pageId]);

  // Requirement 1.7: creation must stay disabled for an empty selection, even
  // if a future caller renders this form without going through
  // SelectionCapture's own null-selection guard. MentionAwareCommentInput
  // independently disables submit for empty/whitespace-only text; this
  // `disabled` guard is ANDed with that check.
  const hasValidAnchor = anchor.quote !== '';

  const formRef = useRef<HTMLDivElement | null>(null);

  // No visible Cancel button (the reference mockup has none): closing without
  // submitting goes through Escape or a click/mousedown outside the form,
  // the same outside-dismissal idiom InlineCommentPreviewPopover uses.
  useEffect(() => {
    if (onCanceled == null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }
      // The mention picker (reactstrap Dropdown) also closes on Escape, but
      // without calling preventDefault -- so without this check, opening it
      // and pressing Escape would close the dropdown AND cancel the whole
      // form in the same keypress. `aria-expanded="true"` is reactstrap's
      // own state marker on the toggle button, so this stays correct even if
      // the dropdown's internal class names change.
      if (formRef.current?.querySelector('[aria-expanded="true"]') != null) {
        return;
      }
      onCanceled();
    };
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      if (
        formRef.current != null &&
        target != null &&
        formRef.current.contains(target)
      ) {
        return;
      }
      onCanceled();
    };

    // Capture phase: reactstrap's own Escape handling on the mention-picker
    // dropdown runs on bubble (React's synthetic event system), and it
    // already flips `aria-expanded` to "false" by the time a bubble-phase
    // listener on `document` would see it -- checking in capture phase reads
    // the DOM before that handler has run.
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [onCanceled]);

  return (
    <div
      ref={formRef}
      className="inline-comment-form bg-body border rounded shadow-sm p-2"
      // Explicit width: this box is positioned by SelectionPopover (Popper),
      // which sizes it via shrink-to-fit. With the quote no longer visible,
      // nothing inside the row has enough intrinsic width to anchor that
      // shrink-to-fit calculation (a flex child with `flex-basis: 0%`
      // contributes ~0 to it), so the editor would collapse to a sliver
      // without a width pinned here. Capped against the viewport width (with
      // a small margin) rather than a bare `24rem`, since Popper's
      // `preventOverflow` only shifts this box to stay on-screen -- it does
      // not shrink it -- and a fixed `24rem` would overflow a narrow phone.
      style={{ width: 'min(24rem, calc(100vw - 2rem))' }}
      data-testid="inline-comment-form"
    >
      {/* Kept as a plain class (not a CSS module one): the inline-comment
          Playwright suite locates the captured quote by this selector to
          verify the right occurrence was anchored, even though it is not
          painted for sighted users. */}
      <blockquote className="inline-comment-form-quote visually-hidden">
        {anchor.quote}
      </blockquote>
      <MentionAwareCommentInput
        editorKey={editorKey}
        disabled={!hasValidAnchor}
        onSubmit={(comment) =>
          create({ pageId, anchorOriginRevisionId, comment, anchor })
        }
        onSubmitted={onSubmitted}
      />
    </div>
  );
};
