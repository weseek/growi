import React from 'react';

import dynamic from 'next/dynamic';


import { useHackmdDraftUpdatedEffect } from '~/client/services/side-effects/hackmd-draft-updated';
import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/side-effects/page-updated';
import { useIsEditable } from '~/stores/context';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { LazyRenderer } from '../Common/LazyRenderer';


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });


type Props = {
  pageView: JSX.Element,
}

export const DisplaySwitcher = (props: Props): JSX.Element => {
  const { pageView } = props;

  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();

  usePageUpdatedEffect();
  useHashChangedEffect();
  useHackmdDraftUpdatedEffect();

  const isViewMode = editorMode === EditorMode.View;

  return (
    <>
      { isViewMode && pageView }

      <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
        <PageEditor />
      </LazyRenderer>

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
    </>
  );
};
