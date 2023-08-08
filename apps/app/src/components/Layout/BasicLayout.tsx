import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from 'reactstrap';

import { useParentPageSelectModal } from '~/stores/modal';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';
import { ParentPageSelectModal } from '../ParentPageSelectModal';
import Sidebar from '../Sidebar';

import { RawLayout } from './RawLayout';


const AlertSiteUrlUndefined = dynamic(() => import('../AlertSiteUrlUndefined').then(mod => mod.AlertSiteUrlUndefined), { ssr: false });
const DeleteAttachmentModal = dynamic(() => import('../PageAttachment/DeleteAttachmentModal').then(mod => mod.DeleteAttachmentModal), { ssr: false });
const HotkeysManager = dynamic(() => import('../Hotkeys/HotkeysManager'), { ssr: false });
// const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });
const PutbackPageModal = dynamic(() => import('../PutbackPageModal'), { ssr: false });
// Page modals
const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
const PageDuplicateModal = dynamic(() => import('../PageDuplicateModal'), { ssr: false });
const PageDeleteModal = dynamic(() => import('../PageDeleteModal'), { ssr: false });
const PageRenameModal = dynamic(() => import('../PageRenameModal'), { ssr: false });
const PagePresentationModal = dynamic(() => import('../PagePresentationModal'), { ssr: false });
const PageAccessoriesModal = dynamic(() => import('../PageAccessoriesModal').then(mod => mod.PageAccessoriesModal), { ssr: false });
const DeleteBookmarkFolderModal = dynamic(() => import('../DeleteBookmarkFolderModal').then(mod => mod.DeleteBookmarkFolderModal), { ssr: false });
// Fab
const Fab = dynamic(() => import('../Fab').then(mod => mod.Fab), { ssr: false });


type Props = {
  children?: ReactNode
  className?: string
}


export const BasicLayout = ({ children, className }: Props): JSX.Element => {
  const {
    open: openModal,
  } = useParentPageSelectModal();

  return (
    <RawLayout className={className ?? ''}>
      <DndProvider backend={HTML5Backend}>
        <GrowiNavbar />

        <div className="page-wrapper d-flex d-print-block">
          <div className="grw-sidebar-wrapper">
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
        <DeleteAttachmentModal />
        <DeleteBookmarkFolderModal />
        <PutbackPageModal />
      </DndProvider>

      <PagePresentationModal />
      <HotkeysManager />

      <Fab />

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />

      <Button onClick={() => openModal()}>Open!</Button>
      <ParentPageSelectModal/>
      {/* TODO: remove unnecessary code with https://redmine.weseek.co.jp/issues/128327 */}
    </RawLayout>
  );
};
