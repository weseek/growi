import React from 'react';

import dynamic from 'next/dynamic';

import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/side-effects/page-updated';
import { useYjsDraftEffect, useYjsAwarenessStateEffect } from '~/client/services/side-effects/yjs-draft';
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
  useYjsDraftEffect();
  useYjsAwarenessStateEffect();

  return (
    <>
      <div className="d-edit-none">
        {pageView}
      </div>

      <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
        { isLatestRevision
          ? <PageEditor />
          : <PageEditorReadOnly />
        }
      </LazyRenderer>
    </>
  );
};
