import { useEditorMode } from '~/stores-universal/ui';

export const useEditorModeClassName = (): string => {
  const { getClassNamesByEditorMode } = useEditorMode();

  return `${getClassNamesByEditorMode().join(' ') ?? ''}`;
};
