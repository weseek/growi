import { useEffect, useState } from 'react';

import { GlobalCodeMirrorEditorKey } from '@growi/editor';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { useTranslation } from 'next-i18next';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { useEditorMode, EditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

import { useIsYjsEnabled } from './yjs';

export const useSingleEditorMode = (): void => {
  const { t } = useTranslation();
  const { data: editorMode } = useEditorMode();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const isYjsEnabled = useIsYjsEnabled();

  const [shouldRecalculate, setShouldRecalculate] = useState(false);

  useEffect(() => {
    if (editorMode === EditorMode.Editor) {
      setShouldRecalculate(true);
    }
    else {
      setShouldRecalculate(false);
    }
  }, [editorMode]);

  useEffect(() => {
    if (shouldRecalculate && isYjsEnabled === false && codeMirrorEditor != null && codeMirrorEditor.view != null) {
      setShouldRecalculate(false);

      codeMirrorEditor.initDoc(currentPage?.revision?.body);

      // eslint-disable-next-line no-alert
      window.alert(t('single-editor-mode-alert', { yjsMaxBodyLength }));
    }
  }, [codeMirrorEditor, currentPage?.revision?.body, isYjsEnabled, shouldRecalculate, t, yjsMaxBodyLength]);

};
