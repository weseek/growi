import React, {
  ReactNode, useEffect, useState,
} from 'react';

import Head from 'next/head';

import { useGrowiTheme } from '~/stores/context';
import { Themes, useNextThemes } from '~/stores/use-next-themes';

import { ThemeProvider } from '../Theme/utils/ThemeProvider';

type Props = {
  title?: string,
  className?: string,
  children?: ReactNode,
}

export const RawLayout = ({ children, title, className }: Props): JSX.Element => {
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }
  const { data: growiTheme } = useGrowiTheme();

  // get color scheme from next-themes
  const { resolvedTheme } = useNextThemes();

  const [colorScheme, setColorScheme] = useState<Themes|undefined>(undefined);

  // set colorScheme in CSR
  useEffect(() => {
    setColorScheme(resolvedTheme as Themes);
  }, [resolvedTheme]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider theme={growiTheme} colorScheme={colorScheme}>
        <div className={classNames.join(' ')} data-color-scheme={colorScheme}>
          {children}
        </div>
      </ThemeProvider>
    </>
  );
};
