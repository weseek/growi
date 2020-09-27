import React, { ReactNode } from 'react';
import Head from 'next/head';

type Props = {
  title: string
  children?: ReactNode
}

const RawLayout = ({ children, title }: Props): JSX.Element => {

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="wrapper">
        {children}
      </div>
    </>
  );
};

export default RawLayout;
