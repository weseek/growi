import { useCallback, useState } from 'react';

import { Collapse } from 'reactstrap';

import { useCodeMirrorEditorIsolated } from '../../../stores';

type TogglarProps = {
  isOpen: boolean,
  onClick?: () => void,
}

const TextFormatToolsToggler = (props: TogglarProps): JSX.Element => {

  const { onClick } = props;

  // TODO: change color by isOpen

  return (
    <button
      type="button"
      className="btn btn-toolbar-button"
      onClick={onClick}
    >
      <span className="material-icons fs-5">text_increase</span>
    </button>
  );
};

type TextFormatToolsType = {
  editorKey: string,
}

export const TextFormatTools = (props: TextFormatToolsType): JSX.Element => {
  const { editorKey } = props;
  const [isOpen, setOpen] = useState(false);
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);

  const toggle = useCallback(() => {
    setOpen(bool => !bool);
  }, []);

  const view = codeMirrorEditor?.view;

  const createReplaceSelectionHandler = useCallback((prefix: string, suffix: string) => {
    return () => {
      const selection = view.state.sliceDoc(
        view.state.selection.main.from,
        view.state.selection.main.to,
      );
      const cursorPos = view.state.selection.main.head;
      let curPosAfterReplacing = {};
      const insertText = view?.state.replaceSelection(prefix + selection + suffix);

      if (insertText) {
        view?.dispatch(insertText);
        if (cursorPos) {
          curPosAfterReplacing = cursorPos + prefix.length;
        }
        view?.dispatch({ selection: { anchor: curPosAfterReplacing } });
        view.focus();
      }
    };
  }, [view]);

  return (
    <div className="d-flex">
      <TextFormatToolsToggler isOpen={isOpen} onClick={toggle} />

      <Collapse isOpen={isOpen} horizontal>
        <div className="d-flex px-1 gap-1" style={{ width: '220px' }}>
          <button type="button" className="btn btn-toolbar-button" onClick={() => createReplaceSelectionHandler('**', '**')()}>
            <span className="material-icons-outlined fs-5">format_bold</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5" onClick={() => createReplaceSelectionHandler('*', '*')()}>format_italic</span>
          </button>
          <button type="button" className="btn btn-toolbar-button" onClick={() => createReplaceSelectionHandler('~', '~')()}>
            <span className="material-icons-outlined fs-5">format_strikethrough</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">code</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_list_bulleted</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_list_numbered</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">checklist</span>
          </button>
        </div>
      </Collapse>
    </div>
  );
};
