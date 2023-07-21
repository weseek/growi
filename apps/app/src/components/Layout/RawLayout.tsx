import React, { ReactNode, useState } from 'react';

import { ColorScheme } from '@growi/core/dist/interfaces';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { useNextThemes, NextThemesProvider } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:cli:RawLayout');


type Props = {
  className?: string,
  children?: ReactNode,
}

export const RawLayout = ({ children, className }: Props): JSX.Element => {
  const classNames: string[] = ['layout-root', 'growi'];
  if (className != null) {
    classNames.push(className);
  }
  // get color scheme from next-themes
  const { resolvedTheme, resolvedThemeByAttributes } = useNextThemes();

  const [colorScheme, setColorScheme] = useState<ColorScheme|undefined>(undefined);

  // set colorScheme in CSR
  useIsomorphicLayoutEffect(() => {
    setColorScheme(resolvedTheme ?? resolvedThemeByAttributes);
  }, [resolvedTheme, resolvedThemeByAttributes]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NextThemesProvider>
        <div className={classNames.join(' ')} data-color-scheme={colorScheme}>
          {children}
          <ToastContainer theme={colorScheme} />
        </div>
      </NextThemesProvider>
    </>
  );
};
