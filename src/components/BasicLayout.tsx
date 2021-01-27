import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';

import RawLayout from './RawLayout';

type Props = {
  title: string
  children?: ReactNode
  growiVersion: string
}

const BasicLayout = ({ children, title, growiVersion }: Props): JSX.Element => {

  const Sidebar = dynamic(() => import('../client/js/components/Sidebar'), { ssr: false });
  const HotkeysManager = dynamic(() => import('../client/js/components/Hotkeys/HotkeysManager'), { ssr: false });
  const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });
  const SystemVersion = dynamic(() => import('./SystemVersion'), { ssr: false });

  return (
    <>
      <RawLayout title={title}>
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
      </RawLayout>

      <PageCreateModal />
      <HotkeysManager />
      <SystemVersion growiVersion={growiVersion} />
    </>
  );
};

export default BasicLayout;
