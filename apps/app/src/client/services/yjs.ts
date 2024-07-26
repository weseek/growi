import { useMemo } from 'react';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

export const useIsYjsEnabled = (): boolean => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  // Recalculated at the time the editor is switched
  const isYjsEnabled = useMemo(() => (
    editorMode === EditorMode.Editor && (currentPage?.revision?.body.length ?? 0) <= (yjsMaxBodyLength ?? 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [editorMode]);

  return isYjsEnabled;
};
