import { memo } from 'react';

import { AcceptedUploadFileType } from '@growi/core';

import type { GlobalCodeMirrorEditorKey } from '../../../consts';

import { AttachmentsDropup } from './AttachmentsDropup';
import { DiagramButton } from './DiagramButton';
import { EmojiButton } from './EmojiButton';
import { TableButton } from './TableButton';
import { TemplateButton } from './TemplateButton';
import { TextFormatTools } from './TextFormatTools';

import styles from './Toolbar.module.scss';

type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  acceptedUploadFileType: AcceptedUploadFileType,
  onAttachmentMenuItemClicked: () => void,
}

export const Toolbar = memo((props: Props): JSX.Element => {

  const { editorKey, onAttachmentMenuItemClicked, acceptedUploadFileType } = props;
  return (
    <div className={`d-flex gap-2 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup editorKey={editorKey} onMenuItemClicked={onAttachmentMenuItemClicked} acceptedUploadFileType={acceptedUploadFileType} />
      <TextFormatTools editorKey={editorKey} />
      <EmojiButton
        editorKey={editorKey}
      />
      <TableButton editorKey={editorKey} />
      <DiagramButton editorKey={editorKey} />
      <TemplateButton editorKey={editorKey} />
    </div>
  );
});
