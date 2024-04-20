import type { ReactNode } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


import { createAnnouncement } from '~/client/util/announcement-utils';
import { AnnouncementStatuses } from '~/features/announcement';
import type { IAnnouncement } from '~/interfaces/announcement';
import { useCurrentUser } from '~/stores/context';
import { useCurrentPageId, useSWRxCurrentPage } from '~/stores/page';

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
const SearchModal = dynamic(() => import('../../features/search/client/components/SearchModal'), { ssr: false });


type Props = {
  children?: ReactNode
  className?: string
}


export const BasicLayout = ({ children, className }: Props): JSX.Element => {

  const { data: user } = useCurrentUser();
  const { data: pageId } = useCurrentPageId();
  const { data: currentPage } = useSWRxCurrentPage();

  const date = new Date();

  const announcement = () => {
    if (user != null && pageId != null && currentPage?.creator != null) {

      const receivers = [currentPage.creator];

      const announcement: IAnnouncement = {
        sender: user,
        comment: 'test',
        isReadReceiptTrackingEnabled: true,
        pageId,
        receivers: [
          {
            receiver: currentPage.creator,
            updatedAt: date,
            readStatus: 'UNREAD',
          },
        ],
      };

      createAnnouncement(announcement, user, pageId, receivers);
    }
    else {
      console.log(user);
      console.log(pageId);
      console.log(currentPage);
      console.log(currentPage?.creator);
    }

  };

  return (
    <RawLayout className={`${className ?? ''}`}>
      <DndProvider backend={HTML5Backend}>

        <div className="page-wrapper flex-row">
          <div className="z-2">
            <Sidebar />
          </div>

          <div className="d-flex flex-grow-1 flex-column z-1">{/* neccessary for nested {children} make expanded */}
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
        <SearchModal />
      </DndProvider>

      <PagePresentationModal />
      <HotkeysManager />

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />

      <button
        type="button"
        onClick={announcement}
      >
        BUTTON
      </button>

    </RawLayout>
  );
};
