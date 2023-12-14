import { useCallback } from 'react';


import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useTemplateModalForEditor } from '../../../stores/use-templete';

type Props = {
  editorKey: string,
}

export const TemplateButton = (props: Props): JSX.Element => {
  const { editorKey } = props;
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);
  const { open: openTempleteModal } = useTemplateModalForEditor();

  const onClickTempleteButton = useCallback(() => {
    const editor = codeMirrorEditor?.view;
    const insertText = (text: string) => editor?.dispatch(editor.state.replaceSelection(text));
    const onSubmit = (templateText: string) => insertText(templateText);
    openTempleteModal({ onSubmit });
  }, [codeMirrorEditor?.view, openTempleteModal]);

  return (
    <button type="button" className="btn btn-toolbar-button" onClick={onClickTempleteButton}>
      <span className="material-symbols-outlined fs-5">file_copy</span>
    </button>
  );
};
