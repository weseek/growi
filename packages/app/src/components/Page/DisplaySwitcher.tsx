import React, { useMemo } from 'react';

import dynamic from 'next/dynamic';


import { useHackmdDraftUpdatedEffect } from '~/client/services/event-listeners/hackmd-draft-updated';
import { useHashChangedEffect } from '~/client/services/event-listeners/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/event-listeners/page-updated';
import { useIsEditable } from '~/stores/context';
import { EditorMode, useEditorMode } from '~/stores/ui';

import CustomTabContent from '../CustomNavigation/CustomTabContent';
import { Page } from '../Page';


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd').then(mod => mod.PageEditorByHackmd), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });


const DisplaySwitcher = React.memo((): JSX.Element => {

  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();

  usePageUpdatedEffect();
  useHashChangedEffect();
  useHackmdDraftUpdatedEffect();

  const isViewMode = editorMode === EditorMode.View;

  const navTabMapping = useMemo(() => {
    return {
      [EditorMode.View]: {
        Content: () => (
          <div data-testid="page-view" id="page-view">
            <Page />
          </div>
        ),
      },
      [EditorMode.Editor]: {
        Content: () => (
          isEditable
            ? (
              <div data-testid="page-editor" id="page-editor">
                <PageEditor />
              </div>
            )
            : <></>
        ),
      },
      [EditorMode.HackMD]: {
        Content: () => (
          isEditable
            ? (
              <div id="page-editor-with-hackmd">
                <PageEditorByHackmd />
              </div>
            )
            : <></>
        ),
      },
    };
  }, [isEditable]);


  return (
    <>
      <CustomTabContent activeTab={editorMode} navTabMapping={navTabMapping} />

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
    </>
  );
});
DisplaySwitcher.displayName = 'DisplaySwitcher';

export default DisplaySwitcher;
