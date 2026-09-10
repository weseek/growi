/**
 * Mention-aware comment input used by `InlineCommentForm.tsx`. Owns the
 * CodeMirror editor assembly, submission, and error display. No Cancel
 * button here — `InlineCommentForm` handles cancellation (Escape / outside
 * click). The actual persistence call is injected via `onSubmit`, so this
 * component has no dependency on the inline-comment store.
 */

import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorView, tooltips } from '@codemirror/view';
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
  /** CodeMirror editor instance key; callers compute one per editor instance. */
  editorKey: string;
  /** Edit-mode initial text, applied to the editor exactly once at mount. */
  initialValue?: string;
  /**
   * Persists the comment text. Rejections are caught here and shown as an
   * error; the caller does not need its own try/catch.
   */
  onSubmit: (commentText: string) => Promise<unknown>;
  /** Called after a successful submit (e.g. to close the form / clear the selection). */
  onSubmitted?: () => void;
  /** An additional, caller-owned guard ANDed with this component's own "has non-empty text" check. */
  disabled?: boolean;
};

export const MentionAwareCommentInput = (
  props: MentionAwareCommentInputProps,
): JSX.Element => {
  const { editorKey, initialValue, onSubmit, onSubmitted, disabled } = props;

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

  // Without an explicit `parent`, the mention-completion popup appends inside
  // `.cm-editor`, which has `overflow: hidden` in its base theme, so it would
  // render clipped in this small fixed-height form instead of floating above it.
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(
      tooltips({ parent: document.body }),
    );
  }, [codeMirrorEditor]);

  // 1080 is one step above Bootstrap's $zindex-popover (1070), so this popup
  // paints above SelectionPopover's portal instead of behind it.
  const tooltipZIndexTheme = useMemo(
    () =>
      EditorView.theme({
        '.cm-tooltip.cm-tooltip-autocomplete': { zIndex: '1080' },
      }),
    [],
  );

  useEffect(() => {
    // Must stay wrapped in an array: EditorView.theme() itself returns two
    // extensions, and appendExtensions would otherwise unpack them into two
    // top-level slots and throw "Duplicate use of compartment".
    return codeMirrorEditor?.appendExtensions?.([tooltipZIndexTheme]);
  }, [codeMirrorEditor, tooltipZIndexTheme]);

  // Applies `initialValue` once codeMirrorEditor first becomes available
  // (it arrives asynchronously, so this effect re-runs until then). The ref
  // flag stops it from re-applying on later re-renders, which would fight
  // the user's own edits.
  const hasAppliedInitialValueRef = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `initialValue` is intentionally excluded -- must not re-run when it changes later.
  useEffect(() => {
    if (hasAppliedInitialValueRef.current || codeMirrorEditor == null) {
      return;
    }
    if (initialValue != null) {
      codeMirrorEditor.initDoc(initialValue);
    }
    hasAppliedInitialValueRef.current = true;
  }, [codeMirrorEditor]);

  const cmProps = useMemo(
    () => ({
      onChange: (value: string) => setCommentText(value),
      basicSetup: { lineNumbers: false, foldGutter: false }, // gutters are wasted space in this one-to-few-line input
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

  const insertMention = useCallback(
    (username: string) => {
      codeMirrorEditor?.insertText(`@${username} `);
    },
    [codeMirrorEditor],
  );

  return (
    <>
      <div className="d-flex align-items-start gap-2">
        {/* flex-basis 0% (not the .flex-grow-1 utility's `auto`): the editor's
            root sets width:100% internally, so an `auto` basis creates a
            circular width reference that collapses this item to near zero. */}
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
