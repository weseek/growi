import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';
import Sidebar from '../Sidebar';

import { RawLayout } from './RawLayout';

const AlertSiteUrlUndefined = dynamic(() => import('../AlertSiteUrlUndefined').then(mod => mod.AlertSiteUrlUndefined), { ssr: false });
const AttachmentDeleteModal = dynamic(() => import('../PageAttachment/AttachmentDeleteModal').then(mod => mod.AttachmentDeleteModal), { ssr: false });
const HotkeysManager = dynamic(() => import('../Hotkeys/HotkeysManager'), { ssr: false });
// const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });
// Page modals
const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
const PageDuplicateModal = dynamic(() => import('../PageDuplicateModal'), { ssr: false });
const PageDeleteModal = dynamic(() => import('../PageDeleteModal'), { ssr: false });
const PageRenameModal = dynamic(() => import('../PageRenameModal'), { ssr: false });
const PagePresentationModal = dynamic(() => import('../PagePresentationModal'), { ssr: false });
const PageAccessoriesModal = dynamic(() => import('../PageAccessoriesModal'), { ssr: false });
// Fab
const Fab = dynamic(() => import('../Fab').then(mod => mod.Fab), { ssr: false });


type Props = {
  children?: ReactNode
  className?: string
}

export const BasicLayout = ({ children, className }: Props): JSX.Element => {
  return (
    <RawLayout className={className ?? ''}>
      <DndProvider backend={HTML5Backend}>
        <GrowiNavbar />

        <div className="page-wrapper d-flex d-print-block">
          <div className="grw-sidebar-wrapper" data-testid="grw-sidebar-wrapper">
            <Sidebar />
          </div>

          <div className="flex-fill mw-0">
            <AlertSiteUrlUndefined />
            {children}
          </div>
        </div>

        <GrowiNavbarBottom />

        <PageCreateModal />
        <PageDuplicateModal />
        <PageDeleteModal />
        <PageRenameModal />
        <PageAccessoriesModal />
        <AttachmentDeleteModal />
      </DndProvider>

      <PagePresentationModal />
      <HotkeysManager />

      <Fab />

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
