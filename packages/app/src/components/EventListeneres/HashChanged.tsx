import { FC, useCallback, useEffect } from 'react';

import { EditorMode, useEditorMode } from '~/stores/ui';
import { useIsEditable } from '~/stores/context';

const HashChanged: FC<void> = () => {
  const { data: isEditable } = useIsEditable();
  const { mutate: mutateEditorMode } = useEditorMode();

  const hashchangeHandler = useCallback(() => {
    const { hash } = window.location;

    if (hash == null) {
      return;
    }

    if (hash === '#edit') {
      mutateEditorMode(EditorMode.Editor);
    }
  }, [mutateEditorMode]);

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

  return null;
};

export default HashChanged;
