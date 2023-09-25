import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';

import { useEditorModeClassName } from '../../client/services/layout';

import { RawLayout } from './RawLayout';

const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });


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
