import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { mutate } from 'swr';

import { Sidebar } from '../Sidebar';

import { RawLayout } from './RawLayout';


const AlertSiteUrlUndefined = dynamic(() => import('../AlertSiteUrlUndefined').then(mod => mod.AlertSiteUrlUndefined), { ssr: false });
const DeleteAttachmentModal = dynamic(() => import('../PageAttachment/DeleteAttachmentModal').then(mod => mod.DeleteAttachmentModal), { ssr: false });
const HotkeysManager = dynamic(() => import('../Hotkeys/HotkeysManager'), { ssr: false });
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


type Props = {
  children?: ReactNode
  className?: string
}

export const BasicLayout = ({ children, className }: Props): JSX.Element => {

  return (
    <RawLayout className={className ?? ''}>
      <DndProvider backend={HTML5Backend}>

        <div className="page-wrapper flex-row">
          <Sidebar />

          <div className="flex-expand-vert">{/* neccessary for nested {children} make expanded */}
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

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
