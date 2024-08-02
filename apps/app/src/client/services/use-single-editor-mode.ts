import { useEffect } from 'react';

import { GlobalCodeMirrorEditorKey } from '@growi/editor';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { useTranslation } from 'next-i18next';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { useSWRxCurrentPage } from '~/stores/page';

import { useIsYjsEnabled } from './yjs';

export const useSingleEditorMode = (): void => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const isYjsEnabled = useIsYjsEnabled();

  // initDoc() is not available unless codeMirrorEditor.view is true
  const shouldRecalculate = isYjsEnabled === false && codeMirrorEditor != null && codeMirrorEditor.view != null;

  useEffect(() => {
    if (shouldRecalculate) {
      codeMirrorEditor.initDoc(currentPage?.revision?.body);

      // eslint-disable-next-line no-alert
      window.alert(t('non-yjs-alert', { yjsMaxBodyLength }));
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRecalculate]);
};
