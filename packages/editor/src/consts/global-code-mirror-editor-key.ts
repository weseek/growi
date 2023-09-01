export const GlobalCodeMirrorEditorKey = {
  MAIN: 'main',
} as const;
export type GlobalCodeMirrorEditorKey = typeof GlobalCodeMirrorEditorKey[keyof typeof GlobalCodeMirrorEditorKey]
