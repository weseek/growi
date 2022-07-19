import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';
import Sidebar from '../Sidebar';

import { RawLayout } from './RawLayout';


type Props = {
  title: string
  className?: string,
  children?: ReactNode
}

export const BasicLayout = ({ children, title, className }: Props): JSX.Element => {

  // const HotkeysManager = dynamic(() => import('../client/js/components/Hotkeys/HotkeysManager'), { ssr: false });
  // const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });
  const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
  const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
  const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });
  // Page modals
  const PageDuplicateModal = dynamic(() => import('../PageDuplicateModal'), { ssr: false });

  return (
    <RawLayout title={title} className={className}>
      <GrowiNavbar />

      <div className="page-wrapper d-flex d-print-block">
        <div className="grw-sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="flex-fill mw-0">
          {children}
        </div>
      </div>

      <GrowiNavbarBottom />

      {/* <PageCreateModal /> */}
      <PageDuplicateModal />
      {/* <HotkeysManager /> */}

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
