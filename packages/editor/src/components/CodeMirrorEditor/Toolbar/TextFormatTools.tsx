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
      <span className="material-symbols-outlined fs-5">match_case</span>
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

  const onClickInsertMarkdownText = (prefix: string, suffix: string) => codeMirrorEditor?.insertMarkdownText(prefix, suffix);

  return (
    <div className="d-flex">
      <TextFormatToolsToggler isOpen={isOpen} onClick={toggle} />

      <Collapse isOpen={isOpen} horizontal>
        <div className="d-flex px-1 gap-1" style={{ width: '220px' }}>
          <button type="button" className="btn btn-toolbar-button" onClick={() => onClickInsertMarkdownText('**', '**')}>
            <span className="material-symbols-outlined fs-5">format_bold</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5" onClick={() => onClickInsertMarkdownText('*', '*')}>format_italic</span>
          </button>
          <button type="button" className="btn btn-toolbar-button" onClick={() => onClickInsertMarkdownText('~', '~')}>
            <span className="material-symbols-outlined fs-5">format_strikethrough</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button" onClick={() => onClickInsertMarkdownText('`', '`')}>
            <span className="material-symbols-outlined fs-5">code</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5">format_list_bulleted</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5">format_list_numbered</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-symbols-outlined fs-5">checklist</span>
          </button>
        </div>
      </Collapse>
    </div>
  );
};
