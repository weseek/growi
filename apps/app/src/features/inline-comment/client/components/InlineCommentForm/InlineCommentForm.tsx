/**
 * Comment-creation form shown by `SelectionCapture` (task 4.2) once a text
 * selection has been captured (design.md's "作成フロー（起点コメント）" sequence:
 * SelectionCapture -> InlineCommentForm -> Store).
 *
 * The mention-aware editor assembly (CodeMirrorEditorComment +
 * useCodeMirrorEditorIsolated + mention extensions), submission, and error
 * display are owned by the shared `MentionAwareCommentInput`
 * (design.md 決定5) so the same building blocks can be reused by the
 * comment-list reply input. This form owns only what is specific to the
 * create-form context: the quote display and the `create()` call.
 */

import type { JSX } from 'react';
import { useMemo } from 'react';

import { useSWRxInlineComments } from '../../stores/inline-comment';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';
import type { CapturedSelection } from '../SelectionCapture/use-text-selection';

import styles from './InlineCommentForm.module.scss';

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

  return (
    <div
      className="inline-comment-form bg-body border rounded shadow-sm p-2"
      data-testid="inline-comment-form"
    >
      {/* `inline-comment-form-quote` is kept as a plain class alongside the
          CSS-module one: the inline-comment Playwright suite locates the quote
          by that selector. */}
      <blockquote
        className={`inline-comment-form-quote small text-body-secondary mb-2 ps-2 ${styles['inline-comment-form-quote']}`}
      >
        {anchor.quote}
      </blockquote>
      <MentionAwareCommentInput
        editorKey={editorKey}
        disabled={!hasValidAnchor}
        onSubmit={(comment) =>
          create({ pageId, anchorOriginRevisionId, comment, anchor })
        }
        onSubmitted={onSubmitted}
        onCancel={onCanceled}
      />
    </div>
  );
};
