import React, { ReactNode } from 'react';
import Link from 'next/link';

import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';

import { useCurrentUser } from '~/stores/context';

import RawLayout from './RawLayout';

type Props = {
  title: string
  children?: ReactNode
}

const BasicLayout = ({ children, title }: Props): JSX.Element => {

  const { data: currentUser } = useCurrentUser();

  return (
    <RawLayout title={title}>
      <div className="wrapper">
        <GrowiNavbar />

        <div className="page-wrapper d-flex d-print-block">
          <div id="grw-sidebar-wrapper"></div>

          <div className="flex-fill mw-0">
            {children}
          </div>
        </div>

        <GrowiNavbarBottom />
      </div>

      <header>
        <nav>
          <Link href="/[[...path]]" as="/" shallow>
            <a>Home</a>
          </Link>{' '}
          |{' '}
          <Link href="/about">
            <a>About</a>
          </Link>{' '}
          |{' '}
          <Link href="/users">
            <a>Users List</a>
          </Link>{' '}
          | <a href="/api/users">Users API</a>
        </nav>
      </header>

      <footer>
        <hr />
        <span>I&apos;m here to stay (Footer)</span>
        <hr />
        <p>currentUser.username: {currentUser?.username}</p>
      </footer>
    </RawLayout>
  );
};

export default BasicLayout;
