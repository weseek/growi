import { memo } from 'react';

import { AttachmentsDropup } from './AttachmentsDropup';
import { DiagramButton } from './DiagramButton';
import { EmojiButton } from './EmojiButton';
import { TableButton } from './TableButton';
import { TemplateButton } from './TemplateButton';
import { TextFormatTools } from './TextFormatTools';

import { AcceptedUploadFileType } from 'src/consts';

import styles from './Toolbar.module.scss';

type Props = {
  onFileOpen: () => void,
  acceptedFileType?: AcceptedUploadFileType
}

export const Toolbar = memo((props: Props): JSX.Element => {

  const { onFileOpen, acceptedFileType } = props;
  return (
    <div className={`d-flex gap-2 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup onFileOpen={onFileOpen} acceptedFileType={acceptedFileType} />
      <TextFormatTools />
      <EmojiButton />
      <TableButton />
      <DiagramButton />
      <TemplateButton />
    </div>
  );
});
