import React, { ReactNode } from 'react';

import { useTheme } from 'next-themes';
import Head from 'next/head';

import { ThemeProvider } from '../Theme/ThemeProvider';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
}

export const RawLayout = ({ children, title, className }: Props): JSX.Element => {

  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }

  // get color scheme from next-themes
  const { resolvedTheme: colorScheme } = useTheme();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider theme="">
        <div className={classNames.join(' ')} data-color-scheme={colorScheme}>
          {children}
        </div>
      </ThemeProvider>
    </>
  );
};
