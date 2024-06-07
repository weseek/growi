import type { ReactNode } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';

import { Sidebar } from '~/components/Sidebar';

import { RawLayout } from './RawLayout';


import styles from './BasicLayout.module.scss';

const moduleClass = styles['grw-basic-layout'] ?? '';


const AlertSiteUrlUndefined = dynamic(() => import('~/components/AlertSiteUrlUndefined').then(mod => mod.AlertSiteUrlUndefined), { ssr: false });
const DeleteAttachmentModal = dynamic(
  () => import('~/components/PageAttachment/DeleteAttachmentModal').then(mod => mod.DeleteAttachmentModal), { ssr: false },
);
const HotkeysManager = dynamic(() => import('~/components/Hotkeys/HotkeysManager'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('~/components/Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('~/components/ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('~/components/SystemVersion'), { ssr: false });
const PutbackPageModal = dynamic(() => import('~/components/PutbackPageModal'), { ssr: false });
// Page modals
const PageCreateModal = dynamic(() => import('~/components/PageCreateModal'), { ssr: false });
const PageDuplicateModal = dynamic(() => import('~/components/PageDuplicateModal'), { ssr: false });
const PageDeleteModal = dynamic(() => import('~/components/PageDeleteModal'), { ssr: false });
const PageRenameModal = dynamic(() => import('~/components/PageRenameModal'), { ssr: false });
const PagePresentationModal = dynamic(() => import('~/components/PagePresentationModal'), { ssr: false });
const PageAccessoriesModal = dynamic(() => import('~/components/PageAccessoriesModal').then(mod => mod.PageAccessoriesModal), { ssr: false });
const GrantedGroupsInheritanceSelectModal = dynamic(() => import('~/components/GrantedGroupsInheritanceSelectModal'), { ssr: false });
const DeleteBookmarkFolderModal = dynamic(
  () => import('~/components/DeleteBookmarkFolderModal').then(mod => mod.DeleteBookmarkFolderModal), { ssr: false },
);
const SearchModal = dynamic(() => import('../../features/search/client/components/SearchModal'), { ssr: false });


type Props = {
  children?: ReactNode
  className?: string
}


export const BasicLayout = ({ children, className }: Props): JSX.Element => {
  return (
    <RawLayout className={`${moduleClass} ${className ?? ''}`}>
      <div className="page-wrapper flex-row">
        <div className="z-2">
          <Sidebar />
        </div>

        <div className="d-flex flex-grow-1 flex-column mw-0 z-1">{/* neccessary for nested {children} make expanded */}
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

      <PagePresentationModal />
      <HotkeysManager />

      <ShortcutsModal />
      <GrantedGroupsInheritanceSelectModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
