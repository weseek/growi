import type { JSX } from 'react';

import dynamic from 'next/dynamic';

import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { useIsEditable } from '~/states/context';
import { useLatestRevision } from '~/states/page';
import { EditorMode, useEditorMode } from '~/states/ui/editor';
import { useReservedNextCaretLine } from '~/stores/editor';

import { LazyRenderer } from '../Common/LazyRenderer';


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorReadOnly = dynamic(() => import('../PageEditor/PageEditorReadOnly').then(mod => mod.PageEditorReadOnly), { ssr: false });


export const DisplaySwitcher = (): JSX.Element => {

  const { editorMode } = useEditorMode();
  const [isEditable] = useIsEditable();
  const [isLatestRevision] = useLatestRevision();

  useHashChangedEffect();
  useReservedNextCaretLine();

  return (
    <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
      { isLatestRevision
        ? <PageEditor />
        : <PageEditorReadOnly />
      }
    </LazyRenderer>
  );
};
