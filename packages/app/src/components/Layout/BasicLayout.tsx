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
  const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
  const PageDuplicateModal = dynamic(() => import('../PageDuplicateModal'), { ssr: false });
  const PageDeleteModal = dynamic(() => import('../PageDeleteModal'), { ssr: false });
  const PageRenameModal = dynamic(() => import('../PageRenameModal'), { ssr: false });
  const PutbackPageModal = dynamic(() => import('../PutbackPageModal'), { ssr: false });

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

      <PageCreateModal />
      <PageDuplicateModal />
      <PageDeleteModal />
      <PageRenameModal />
      <PutbackPageModal />
      {/* <HotkeysManager /> */}

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
