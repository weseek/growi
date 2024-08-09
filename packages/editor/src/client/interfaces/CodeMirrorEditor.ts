import type { AcceptedUploadFileType } from '@growi/core';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import type { EditorSettings } from '../../consts';

export type CodeMirrorEditorProps = {
  /**
   * Specity the props for the react-codemirror component. **This must be a memolized object.**
   */
  cmProps?: ReactCodeMirrorProps,
  acceptedUploadFileType?: AcceptedUploadFileType,
  indentSize?: number,
  editorSettings?: EditorSettings,
  onSave?: () => void,
  onUpload?: (files: File[]) => void,
  onScroll?: () => void,
}
