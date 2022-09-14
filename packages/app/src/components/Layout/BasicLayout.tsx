import React, { ReactNode } from 'react';

import { pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';

import { useCurrentPathname } from '~/stores/context';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';
import Sidebar from '../Sidebar';

import { RawLayout } from './RawLayout';

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
const PagePresentationModal = dynamic(() => import('../PagePresentationModal'), { ssr: false });
const PageAccessoriesModal = dynamic(() => import('../PageAccessoriesModal'), { ssr: false });
// Fab
const Fab = dynamic(() => import('../Fab'), { ssr: false });


type Props = {
  title: string
  className?: string,
  expandContainer?: boolean,
  children?: ReactNode
}

export const BasicLayout = ({
  children, title, className, expandContainer,
}: Props): JSX.Element => {

  const { data: currentPathname } = useCurrentPathname();

  const isSharedPage = pagePathUtils.isSharedPage(currentPathname ?? '');

  const myClassName = `${className ?? ''} ${expandContainer ? 'growi-layout-fluid' : ''}`;

  return (
    <RawLayout title={title} className={myClassName}>
      <GrowiNavbar />

      {isSharedPage
        ? (
          <>{children}</>
        )
        : (
          <div className="page-wrapper d-flex d-print-block">
            <div className="grw-sidebar-wrapper">
              <Sidebar />
            </div>

            <div className="flex-fill mw-0">
              {children}
            </div>
          </div>
        )
      }

      <GrowiNavbarBottom />

      <PageCreateModal />
      <PageDuplicateModal />
      <PageDeleteModal />
      <PageRenameModal />
      <PagePresentationModal />
      <PageAccessoriesModal />
      {/* <HotkeysManager /> */}

      <Fab />

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
