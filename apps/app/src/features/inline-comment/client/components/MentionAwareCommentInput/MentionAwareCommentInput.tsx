/**
 * Mention-aware comment input used by `InlineCommentForm.tsx`. Owns the
 * CodeMirror editor assembly (`CodeMirrorEditorComment` +
 * `useCodeMirrorEditorIsolated` + mention completion/decoration extensions,
 * following `CommentEditor.tsx`'s mention-aware textarea pattern),
 * submission, and error display.
 *
 * The editor sits in one row alongside the mention-picker and submit
 * buttons (buttons pinned to the top-right via `align-items-start`, so a
 * multi-line comment grows the editor without moving them). There is no
 * Cancel button here -- `InlineCommentForm` handles cancellation itself
 * (Escape key / outside click), matching the reference mockup, which shows
 * no Cancel affordance at all.
 *
 * The actual persistence call (creating an origin comment) is intentionally
 * NOT owned here: the caller injects it via `onSubmit`, so this component
 * has no dependency on the inline-comment store.
 */

import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSetResolvedTheme } from '@growi/editor';
import { CodeMirrorEditorComment } from '@growi/editor/dist/client/components/CodeMirrorEditorComment';
import {
  createMentionCompletionExtension,
  mentionDecorationSettings,
} from '@growi/editor/dist/client/services';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { useTranslation } from 'react-i18next';

import { useNextThemes } from '~/stores-universal/use-next-themes';

import { fetchMentionUsers } from '../../services/fetch-mention-users';
import { MentionPickerButton } from '../InlineCommentForm/MentionPickerButton';

type MentionAwareCommentInputProps = {
  /**
   * CodeMirror editor instance key. Callers compute this themselves: one
   * shared "new comment" editor per page (`InlineCommentForm`'s
   * `inline_comment_new_${pageId}`, mirroring `CommentEditor`'s
   * `GlobalCodeMirrorEditorKey.COMMENT_NEW` reuse), or one per reply thread
   * for the future reply-input consumer.
   */
  editorKey: string;
  /**
   * Persists the comment text. Rejections are caught here and shown as an
   * error; the caller does not need its own try/catch.
   */
  onSubmit: (commentText: string) => Promise<unknown>;
  /** Called after a successful submit (e.g. to close the form / clear the selection). */
  onSubmitted?: () => void;
  /**
   * An additional, caller-owned guard ANDed with this component's own
   * "has non-empty text" check (e.g. `InlineCommentForm`'s Requirement 1.7
   * anchor-quote guard, which this component has no way to know about on
   * its own since it never receives the anchor).
   */
  disabled?: boolean;
};

export const MentionAwareCommentInput = (
  props: MentionAwareCommentInputProps,
): JSX.Element => {
  const { editorKey, onSubmit, onSubmitted, disabled } = props;

  const { t } = useTranslation();

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);

  const setResolvedTheme = useSetResolvedTheme();
  const { resolvedTheme } = useNextThemes();
  useEffect(() => {
    setResolvedTheme(resolvedTheme);
  }, [resolvedTheme, setResolvedTheme]);

  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string>();

  const mentionExtension = useMemo(
    () => createMentionCompletionExtension(fetchMentionUsers),
    [],
  );

  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.([mentionDecorationSettings]);
  }, [codeMirrorEditor]);

  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(mentionExtension);
  }, [codeMirrorEditor, mentionExtension]);

  const cmProps = useMemo(
    () => ({
      onChange: (value: string) => setCommentText(value),
      // The line-number and fold gutters come from @uiw/react-codemirror's
      // default `basicSetup: true`; this is a one-to-few line input where
      // that gutter width is pure wasted space (design.md 決定5).
      basicSetup: { lineNumbers: false, foldGutter: false },
    }),
    [],
  );

  const canSubmit = disabled !== true && commentText.trim() !== '';

  const submitHandler = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    try {
      await onSubmit(commentText);
      codeMirrorEditor?.initDoc('');
      setCommentText('');
      setError(undefined);
      onSubmitted?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when posting the comment',
      );
    }
  }, [canSubmit, onSubmit, commentText, codeMirrorEditor, onSubmitted]);

  // Requirement 3.3 (inline-comment-creation spec): inserts "@<username> " at
  // the current cursor position in the comment body, via the same
  // insertText API EmojiButton.tsx uses for its own "insert at cursor" pattern.
  const insertMention = useCallback(
    (username: string) => {
      codeMirrorEditor?.insertText(`@${username} `);
    },
    [codeMirrorEditor],
  );

  return (
    <>
      <div className="d-flex align-items-start gap-2">
        {/* `flex: 1 1 0%` (not the `.flex-grow-1` utility, which leaves
            `flex-basis: auto`): the editor's own root sets `width: 100%`
            internally, so an `auto` basis makes this item's width depend on
            its content's width, which depends on the item's own width --
            a circular reference the browser resolves by collapsing it to
            near zero. Pinning the basis to 0% breaks that circularity, and
            `min-width: 0` overrides the flex-item default of `auto`, which
            would otherwise refuse to shrink below the (still-circular)
            content width and push the button column out of the row. */}
        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
          <CodeMirrorEditorComment
            editorKey={editorKey}
            cmProps={cmProps}
            hideToolbar
            onSave={submitHandler}
          />
        </div>
        <div className="d-flex align-items-center gap-1">
          <MentionPickerButton onInsert={insertMention} />
          <button
            type="button"
            className="btn btn-primary btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{ width: '2rem', height: '2rem' }}
            data-testid="inline-comment-submit-button"
            disabled={!canSubmit}
            onClick={submitHandler}
            aria-label={t('page_comment.comment')}
          >
            <span className="material-symbols-outlined fs-6" aria-hidden="true">
              send
            </span>
          </button>
        </div>
      </div>
      {error != null && (
        <span className="text-danger small d-block mt-1">{error}</span>
      )}
    </>
  );
};
