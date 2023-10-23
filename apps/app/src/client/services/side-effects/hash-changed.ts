import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useIsEditablePage } from '~/stores/page';
import { useEditorMode, determineEditorModeByHash } from '~/stores/ui';

/**
 * Change editorMode by browser forward/back operation
 */
export const useHashChangedEffect = (): void => {
  const router = useRouter();

  const { data: isEditablePage } = useIsEditablePage();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();

  const hashchangeHandler = useCallback(() => {
    const newEditorMode = determineEditorModeByHash();

    if (editorMode !== newEditorMode) {
      mutateEditorMode(newEditorMode);
    }
  }, [editorMode, mutateEditorMode]);

  // setup effect
  useEffect(() => {
    if (!isEditablePage) {
      return;
    }

    window.addEventListener('hashchange', hashchangeHandler);

    // return remove handler
    return function cleanup() {
      window.removeEventListener('hashchange', hashchangeHandler);
    };

  }, [hashchangeHandler, isEditablePage]);

  /*
  * Route changes by Next Router
  * https://nextjs.org/docs/api-reference/next/router
  */
  useEffect(() => {
    router.events.on('routeChangeComplete', hashchangeHandler);

    return () => {
      router.events.off('routeChangeComplete', hashchangeHandler);
    };
  }, [hashchangeHandler, router.events]);
};
