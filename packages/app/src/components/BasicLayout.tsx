import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
// import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';

import { RawLayout } from './RawLayout';


type Props = {
  title: string
  className?: string,
  children?: ReactNode
}

export const BasicLayout = ({ children, title, className }: Props): JSX.Element => {

  // const Sidebar = dynamic(() => import('../client/js/components/Sidebar'), { ssr: false });
  // const HotkeysManager = dynamic(() => import('../client/js/components/Hotkeys/HotkeysManager'), { ssr: false });
  // const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });
  const ShortcutsModal = dynamic(() => import('./ShortcutsModal'), { ssr: false });
  const SystemVersion = dynamic(() => import('./SystemVersion'), { ssr: false });

  return (
    <>
      <RawLayout title={title} className={className}>
        {/* <GrowiNavbar /> */}
        GrowiNavbar

        <div className="page-wrapper d-flex d-print-block">
          <div className="grw-sidebar-wrapper">
            {/* <Sidebar /> */}
            Sidebar
          </div>

          <div className="flex-fill mw-0">
            {children}
          </div>
        </div>

        {/* <GrowiNavbarBottom /> */}
        GrowiNavbarBottom
      </RawLayout>

      {/* <PageCreateModal /> */}
      {/* <HotkeysManager /> */}

      <ShortcutsModal />
      <SystemVersion />

      {/* Link test */}
      <Link href="/629581929e61e2a5fe4c64a5">
        <a>/629581929e61e2a5fe4c64a5</a>
      </Link>
      <br />
      <a href="https://www.google.com/">https://www.google.com/</a>
    </>
  );
};
