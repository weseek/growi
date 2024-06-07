import type { ReactNode } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';

import { useEditorModeClassName } from '../../client/services/layout';

import { RawLayout } from './RawLayout';

const PageCreateModal = dynamic(() => import('~/components/PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('~/components/Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('~/components/ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('~/components/SystemVersion'), { ssr: false });


type Props = {
  children?: ReactNode
}

export const ShareLinkLayout = ({ children }: Props): JSX.Element => {
  const className = useEditorModeClassName();

  return (
    <RawLayout className={className}>

      <div className="page-wrapper">
        {children}
      </div>

      <GrowiNavbarBottom />

      <ShortcutsModal />
      <PageCreateModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
