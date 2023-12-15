export const GlobalCodeMirrorEditorKey = {
  MAIN: 'main',
  COMMENT: 'comment',
} as const;
export type GlobalCodeMirrorEditorKey = typeof GlobalCodeMirrorEditorKey[keyof typeof GlobalCodeMirrorEditorKey]
