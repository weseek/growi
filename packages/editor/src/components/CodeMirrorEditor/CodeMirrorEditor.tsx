import {
  forwardRef, useMemo, useRef, useEffect, useCallback,
} from 'react';

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { indentUnit } from '@codemirror/language';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { useEmojiHintModal } from '~/stores/modal';

import { GlobalCodeMirrorEditorKey } from '../../consts';
import { useCodeMirrorEditorIsolated } from '../../stores';

import { completeEmojiInput } from './EmojiHint/EmojiHint';
import { Toolbar } from './Toolbar';

import style from './CodeMirrorEditor.module.scss';

const CodeMirrorEditorContainer = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} className={`flex-expand-vert ${style['codemirror-editor-container']}`} ref={ref} />
  );
});


type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  onChange?: (value: string) => void,
  indentSize?: number,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    onChange,
    indentSize,
  } = props;

  const { open: openEmojiHintModal } = useEmojiHintModal();

  const containerRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange,
    };
  }, [onChange]);
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey, containerRef.current, cmProps);

  useEffect(() => {
    if (indentSize == null) {
      return;
    }
    const extension = indentUnit.of(' '.repeat(indentSize));

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, indentSize]);

  const onInputColonHandler = useCallback((event: any) => {
    if (event.key === ':') {
      openEmojiHintModal();
    }
  }, []);

  const emojiMarkdownCompletions = markdownLanguage.data.of({
    autocomplete: completeEmojiInput,
  });

  useEffect(() => {
    document.addEventListener('keydown', onInputColonHandler, false);
    return () => {
      document.removeEventListener('keydown', onInputColonHandler, false);
    };
  }, [onInputColonHandler]);

  return (
    <div className="flex-expand-vert">
      <CodeMirrorEditorContainer ref={containerRef} />
      <Toolbar codeMirrorEditor={codeMirrorEditor} />
    </div>
  );
};
