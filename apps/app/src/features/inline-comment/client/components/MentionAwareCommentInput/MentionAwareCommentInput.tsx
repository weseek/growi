/**
 * Shared mention-aware comment input, extracted from `InlineCommentForm.tsx`
 * (design.md 決定5: "インラインコメント返信のUIを、通常コメントの「Reply...」⇄
 * 入力欄トグルと同じ形にする"). Owns the CodeMirror editor assembly (the same
 * `CodeMirrorEditorComment` + `useCodeMirrorEditorIsolated` + mention
 * completion/decoration extensions `InlineCommentForm.tsx` already used,
 * itself following `CommentEditor.tsx`'s mention-aware textarea pattern),
 * submission, and error display.
 *
 * The actual persistence call (creating an origin comment vs. posting a
 * reply) is intentionally NOT owned here: callers inject it via `onSubmit`,
 * so both `InlineCommentForm` (task 5.1, `create()`) and the future
 * `InlineCommentReplies` reply input (task 5.2, `createReply()`) can reuse
 * this component without this module depending on either store hook.
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
  /** Called when the user cancels without submitting. */
  onCancel?: () => void;
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
  const { editorKey, onSubmit, onSubmitted, onCancel, disabled } = props;

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
      <CodeMirrorEditorComment
        editorKey={editorKey}
        cmProps={cmProps}
        hideToolbar
        onSave={submitHandler}
      />
      {error != null && <span className="text-danger small">{error}</span>}
      <div className="d-flex align-items-center gap-2 mt-2">
        <MentionPickerButton onInsert={insertMention} />
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary ms-auto"
          onClick={onCancel}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          data-testid="inline-comment-submit-button"
          disabled={!canSubmit}
          onClick={submitHandler}
        >
          {t('page_comment.comment')}
        </button>
      </div>
    </>
  );
};
