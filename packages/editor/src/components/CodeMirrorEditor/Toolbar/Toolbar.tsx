import { memo } from 'react';

import { AttachmentsDropup } from './AttachmentsDropup';
import { DiagramButton } from './DiagramButton';
import { EmojiButton } from './EmojiButton';
import { EmojiHint } from './EmojiHint';
import { TableButton } from './TableButton';
import { TemplateButton } from './TemplateButton';
import { TextFormatTools } from './TextFormatTools';

import styles from './Toolbar.module.scss';

export const Toolbar = memo((): JSX.Element => {
  EmojiHint();

  return (
    <div className={`d-flex gap-2 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup />
      <TextFormatTools />
      <EmojiButton />
      <TableButton />
      <DiagramButton />
      <TemplateButton />
      <EmojiHint />
    </div>
  );
});
