import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useIsContainerFluid } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';
import Sidebar from '../Sidebar';

import { RawLayout } from './RawLayout';

const AlertSiteUrlUndefined = dynamic(() => import('../AlertSiteUrlUndefined').then(mod => mod.AlertSiteUrlUndefined), { ssr: false });
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
  className?: string,
  children?: ReactNode
}

export const BasicLayout = ({ children, className }: Props): JSX.Element => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: dataIsContainerFluid } = useIsContainerFluid();

  const isContainerFluidEachPage = currentPage == null || !('expandContentWidth' in currentPage)
    ? null
    : currentPage.expandContentWidth;
  const isContainerFluidDefault = dataIsContainerFluid;
  const isContainerFluid = isContainerFluidEachPage ?? isContainerFluidDefault;

  const myClassName = `${className ?? ''} ${isContainerFluid ? 'growi-layout-fluid' : ''}`;

  return (
    <RawLayout className={myClassName}>

      <DndProvider backend={HTML5Backend}>
        <GrowiNavbar />

        <div className="page-wrapper d-flex d-print-block">
          <div className="grw-sidebar-wrapper">
            <Sidebar />
          </div>

          <div className="flex-fill mw-0" style={{ position: 'relative' }}>
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
      </DndProvider>

      <PagePresentationModal />
      <HotkeysManager />

      <Fab />

      <ShortcutsModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
