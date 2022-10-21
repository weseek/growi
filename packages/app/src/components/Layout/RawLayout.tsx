import React, { ReactNode, useState } from 'react';

import Head from 'next/head';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { useGrowiTheme } from '~/stores/context';
import { ColorScheme, useNextThemes, NextThemesProvider } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';


import { ThemeProvider as GrowiThemeProvider } from '../Theme/utils/ThemeProvider';


const logger = loggerFactory('growi:cli:RawLayout');


type Props = {
  title?: string,
  className?: string,
  children?: ReactNode,
}

export const RawLayout = ({ children, title, className }: Props): JSX.Element => {
  const classNames: string[] = ['layout-root'];
  if (className != null) {
    classNames.push(className);
  }
  const { data: growiTheme } = useGrowiTheme();

  // get color scheme from next-themes
  const { resolvedTheme, resolvedThemeByAttributes } = useNextThemes();

  const [colorScheme, setColorScheme] = useState<ColorScheme|undefined>(undefined);

  // set colorScheme in CSR
  useIsomorphicLayoutEffect(() => {
    setColorScheme(resolvedTheme ?? resolvedThemeByAttributes);
  }, [resolvedTheme]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NextThemesProvider>
        <GrowiThemeProvider theme={growiTheme} colorScheme={colorScheme}>
          <div className={classNames.join(' ')} data-color-scheme={colorScheme}>
            {children}
          </div>
        </GrowiThemeProvider>
      </NextThemesProvider>
    </>
  );
};
