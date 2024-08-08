import React, { useMemo } from 'react';

import { type IUserHasId } from '@growi/core';
import { GlobalCodeMirrorEditorKey } from '@growi/editor';
import { CodeMirrorEditorMain } from '@growi/editor/dist/client/components/CodeMirrorEditorMain';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { type CodeMirrorEditorProps } from '@growi/editor/src/client/components-internal/CodeMirrorEditor';
import { useCollaborativeEditorMode } from '@growi/editor/src/client/stores/use-collaborative-editor-mode';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import deepmerge from 'ts-deepmerge';

import { useSingleEditorMode } from '~/client/services/use-single-editor-mode';

type PageEditorSwitcherProps = CodeMirrorEditorProps & {
  isYjsEnabled?: boolean
  user?: IUserHasId
  pageId?: string
  onEditorsUpdated?: (userList: IUserHasId[]) => void,
};

export const PageEditorMainSwitcher = React.memo((props: PageEditorSwitcherProps): JSX.Element => {
  const {
    isYjsEnabled, cmProps, user, pageId, onEditorsUpdated, ...otherProps
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  useSingleEditorMode();
  useCollaborativeEditorMode(isYjsEnabled ?? false, user, pageId, onEditorsUpdated, codeMirrorEditor);

  const cmPropsOverride = useMemo<ReactCodeMirrorProps>(() => deepmerge(
    cmProps ?? {},
    {
      // Disable the basic history configuration since this component uses Y.UndoManager instead
      basicSetup: {
        history: !isYjsEnabled,
      },
    },
  ), [cmProps, isYjsEnabled]);

  return (
    <CodeMirrorEditorMain
      cmProps={cmPropsOverride}
      {...otherProps}
    />
  );
});
