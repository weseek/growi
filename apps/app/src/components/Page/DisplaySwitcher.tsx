import dynamic from 'next/dynamic';

import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { useIsEditable } from '~/stores/context';
import { useIsLatestRevision } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { LazyRenderer } from '../Common/LazyRenderer';

const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorReadOnly = dynamic(() => import('../PageEditor/PageEditorReadOnly').then(mod => mod.PageEditorReadOnly), { ssr: false });


export const DisplaySwitcher = (): JSX.Element => {

  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();
  const { data: isLatestRevision } = useIsLatestRevision();

  useHashChangedEffect();

  return (
    <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
      { isLatestRevision
        ? <PageEditor />
        : <PageEditorReadOnly />
      }
    </LazyRenderer>
  );
};
