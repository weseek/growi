import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';

import { withUnstatedContainers } from '~/client/js/components/UnstatedUtils';
// import AppContainer from '~/client/js/services/AppContainer';
import CounterContainer from '~/client/js/services/CounterContainer';

import { useCurrentUser } from '~/stores/context';

type Props = {
  // appContainer: AppContainer,
  counterContainer: CounterContainer,

  title: string
  children?: ReactNode
}

const Layout = ({ counterContainer, children, title }: Props) => {

  const { data: currentUser } = useCurrentUser({ username: 'hoge' });

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
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
      {children}
      <footer>
        <hr />
        <span>I&apos;m here to stay (Footer)</span>
        <hr />
        <p>count: {counterContainer.state.count}</p>
        <p>currentUser.username: {currentUser.username}</p>
      </footer>
    </div>
  );
};

export default withUnstatedContainers(Layout, [CounterContainer]);
