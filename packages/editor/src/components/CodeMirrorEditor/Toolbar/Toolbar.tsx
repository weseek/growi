import { memo } from 'react';

import { AcceptedUploadFileType } from '../../../consts';

import { AttachmentsDropup } from './AttachmentsDropup';
import { DiagramButton } from './DiagramButton';
import { EmojiButton } from './EmojiButton';
import { TableButton } from './TableButton';
import { TemplateButton } from './TemplateButton';
import { TextFormatTools } from './TextFormatTools';


import styles from './Toolbar.module.scss';

type Props = {
  editorKey: string,
  onFileOpen: () => void,
  acceptedFileType: AcceptedUploadFileType,
  onClickTableBtn: () => void,
}

export const Toolbar = memo((props: Props): JSX.Element => {

  const {
    editorKey, onFileOpen, acceptedFileType, onClickTableBtn,
  } = props;

  return (
    <div className={`d-flex gap-2 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup onFileOpen={onFileOpen} acceptedFileType={acceptedFileType} />
      <TextFormatTools />
      <EmojiButton
        editorKey={editorKey}
      />
      <TableButton onClickTableBtn={onClickTableBtn} />
      <DiagramButton />
      <TemplateButton />
    </div>
  );
});
