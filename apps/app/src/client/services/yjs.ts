import { useEffect, useMemo } from 'react';

import { GlobalCodeMirrorEditorKey } from '@growi/editor';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { useTranslation } from 'next-i18next';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

export const useIsYjsEnabled = (): boolean | undefined => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  const revisionBody = currentPage?.revision?.body;
  const shoulRecalculate = editorMode === EditorMode.Editor && revisionBody != null && yjsMaxBodyLength != null;

  const isYjsEnabled = useMemo(() => {
    if (!shoulRecalculate) {
      return undefined;
    }

    return revisionBody.length <= yjsMaxBodyLength;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoulRecalculate]);

  return isYjsEnabled;
};

export const useNonYjsModeEffect = (): void => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const isYjsEnabled = useIsYjsEnabled();

  const shouldRecalculate = isYjsEnabled === false && codeMirrorEditor != null && codeMirrorEditor.view != null && t != null;

  useEffect(() => {
    if (shouldRecalculate) {
      codeMirrorEditor.initDoc(currentPage?.revision?.body);

      // eslint-disable-next-line no-alert
      window.alert(t('non-yjs-alert', { yjsMaxBodyLength }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRecalculate]);
};
