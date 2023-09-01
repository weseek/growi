import { AttachmentsDropup } from './AttachmentsDropup';
import { TextFormatTools } from './TextFormatTools';

import styles from './Toolbar.module.scss';

export const Toolbar = (): JSX.Element => {
  return (
    <div className={`d-flex gap-3 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup />
      <TextFormatTools />
    </div>
  );
};
