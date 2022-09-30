import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';

import { GrowiNavbar } from '../Navbar/GrowiNavbar';

import { RawLayout } from './RawLayout';

const PageCreateModal = dynamic(() => import('../PageCreateModal'), { ssr: false });
const GrowiNavbarBottom = dynamic(() => import('../Navbar/GrowiNavbarBottom').then(mod => mod.GrowiNavbarBottom), { ssr: false });
const ShortcutsModal = dynamic(() => import('../ShortcutsModal'), { ssr: false });
const SystemVersion = dynamic(() => import('../SystemVersion'), { ssr: false });

// Fab
const Fab = dynamic(() => import('../Fab').then(mod => mod.Fab), { ssr: false });


type Props = {
  title: string
  className?: string,
  expandContainer?: boolean,
  children?: ReactNode
}

export const ShareLinkLayout = ({
  children, title, className, expandContainer,
}: Props): JSX.Element => {

  const myClassName = `${className ?? ''} ${expandContainer ? 'growi-layout-fluid' : ''}`;

  return (
    <RawLayout title={title} className={myClassName}>
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
