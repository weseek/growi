import { forwardRef } from 'react';

import style from './CodeMirrorEditorContainer.module.scss';

export const CodeMirrorEditorContainer = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} className={`${style['codemirror-editor-container']}`} ref={ref} />
  );
});
