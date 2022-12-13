import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';

import { useIsContainerFluid } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';

import { RawLayout } from './RawLayout';

const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });

// Fab
const Fab = dynamic(() => import('../Fab').then(mod => mod.Fab), { ssr: false });


type Props = {
  children?: ReactNode
}

export const ShareLinkLayout = ({ children }: Props): JSX.Element => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: dataIsContainerFluid } = useIsContainerFluid();

  const isContainerFluidEachPage = currentPage == null || !('expandContentWidth' in currentPage)
    ? null
    : currentPage.expandContentWidth;
  const isContainerFluidDefault = dataIsContainerFluid;
  const isContainerFluid = isContainerFluidEachPage ?? isContainerFluidDefault;

  const myClassName = `${isContainerFluid ? 'growi-layout-fluid' : ''}`;

  return (
    <RawLayout className={myClassName}>
      <GrowiNavbar />

      <div className="page-wrapper d-flex d-print-block">
        <div className="flex-fill mw-0" style={{ position: 'relative' }}>
          {children}
        </div>
      </div>

      <GrowiNavbarBottom />

      <Fab />

      <ShortcutsModal />
      <PageCreateModal />
      <SystemVersion showShortcutsButton />
    </RawLayout>
  );
};
