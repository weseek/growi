import React from 'react';

import dynamic from 'next/dynamic';

import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/side-effects/page-updated';
import { useIsEditable } from '~/stores/context';
import { useIsLatestRevision } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { LazyRenderer } from '../Common/LazyRenderer';

const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorReadOnly = dynamic(() => import('../PageEditor/PageEditorReadOnly').then(mod => mod.PageEditorReadOnly), { ssr: false });

type Props = {
  pageView: JSX.Element,
}

export const DisplaySwitcher = (props: Props): JSX.Element => {
  const { pageView } = props;

  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();
  const { data: isLatestRevision } = useIsLatestRevision();

  usePageUpdatedEffect();
  useHashChangedEffect();

  const isViewMode = editorMode === EditorMode.View;

  return (
    <>
      { isViewMode && pageView }

      <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
        { isLatestRevision
          ? <PageEditor />
          : <PageEditorReadOnly />
        }
      </LazyRenderer>
    </>
  );
};
