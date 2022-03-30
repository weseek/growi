import React, { useCallback, useEffect } from 'react';

import { useEditorMode, determineEditorModeByHash } from '~/stores/ui';
import { useIsEditable } from '~/stores/context';

/**
 * Change editorMode by browser forward/back operation
 */
const HashChanged = (): JSX.Element => {
  const { data: isEditable } = useIsEditable();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();

  const hashchangeHandler = useCallback(() => {
    const newEditorMode = determineEditorModeByHash();

    if (editorMode !== newEditorMode) {
      mutateEditorMode(newEditorMode);
    }
  }, [editorMode, mutateEditorMode]);

  // setup effect
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    window.addEventListener('hashchange', hashchangeHandler);

    // return remove handler
    return function cleanup() {
      window.removeEventListener('hashchange', hashchangeHandler);
    };

  }, [hashchangeHandler, isEditable, mutateEditorMode]);

  return <></>;
};

export default HashChanged;
