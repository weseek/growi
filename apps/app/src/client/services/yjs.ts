import { useMemo } from 'react';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

export const useIsYjsEnabled = (): boolean | undefined => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  const revisionBody = currentPage?.revision?.body;
  const shouldRecalculate = editorMode === EditorMode.Editor && revisionBody != null && yjsMaxBodyLength != null;

  const isYjsEnabled = useMemo(() => {
    if (!shouldRecalculate) {
      return undefined;
    }

    return revisionBody.length <= yjsMaxBodyLength;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRecalculate]);

  return isYjsEnabled;
};
