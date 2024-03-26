export const GlobalCodeMirrorEditorKey = {
  MAIN: 'main',
  COMMENT: 'comment',
  DIFF: 'diff',
  READONLY: 'readonly',
} as const;
export type GlobalCodeMirrorEditorKey = typeof GlobalCodeMirrorEditorKey[keyof typeof GlobalCodeMirrorEditorKey]
