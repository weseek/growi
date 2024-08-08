import {
  useState, useEffect, useCallback,
} from 'react';

import { useRouter } from 'next/router';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

export const useIsYjsEnabled = (): boolean | undefined => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  const [isYjsEnabled, setIsYjsEnabled] = useState<boolean | undefined>(undefined);
  const [shouldRecalculate, setShouldRecalculate] = useState<boolean>(false);

  const router = useRouter();

  const onRouterChangeComplete = useCallback(() => {
    setIsYjsEnabled(undefined);
    setShouldRecalculate(false);
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', onRouterChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', onRouterChangeComplete);
    };
  }, [onRouterChangeComplete, router.events]);

  useEffect(() => {
    if (editorMode === EditorMode.Editor) {
      setShouldRecalculate(true);
    }
    else {
      setShouldRecalculate(false);
      setIsYjsEnabled(undefined);
    }
  }, [editorMode]);

  useEffect(() => {
    if (shouldRecalculate && currentPage?.revision?.body != null && yjsMaxBodyLength != null) {
      setShouldRecalculate(false);
      setIsYjsEnabled(currentPage.revision.body.length <= yjsMaxBodyLength);
    }
  }, [currentPage?.revision?.body, shouldRecalculate, yjsMaxBodyLength]);

  return isYjsEnabled;
};
