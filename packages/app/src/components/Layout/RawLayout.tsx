import React, { ReactNode, useState } from 'react';

import Head from 'next/head';
import Image from 'next/image';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { useGrowiTheme } from '~/stores/context';
import { ColorScheme, ResolvedThemes, useNextThemes } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';

import { getBackgroundImageSrc } from '../Theme/utils/ThemeImageProvider';
import { ThemeProvider } from '../Theme/utils/ThemeProvider';
import { isClient } from '@growi/core';


const logger = loggerFactory('growi:cli:RawLayout');


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
  const { resolvedTheme, resolvedThemeByAttributes } = useNextThemes();

  const [colorScheme, setColorScheme] = useState<ColorScheme|undefined>(undefined);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | undefined>(undefined);

  // set colorScheme in CSR
  useIsomorphicLayoutEffect(() => {
    setColorScheme(resolvedTheme ?? resolvedThemeByAttributes);
  }, [resolvedTheme]);

  // set background image
  useIsomorphicLayoutEffect(() => {
    const imgSrc = getBackgroundImageSrc(growiTheme, colorScheme);
    setBackgroundImageSrc(imgSrc);
  }, [growiTheme, colorScheme]);

  const scriptToRewriteDataColorScheme = isClient() ? `
    wrapper = document.getElementById('wrapper');
    wrapper.setAttribute('data-color-scheme', '${resolvedThemeByAttributes}');
  ` : '';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        {/* set data-color-scheme immediately after load */}
        <script>{scriptToRewriteDataColorScheme}</script>
      </Head>
      <ThemeProvider theme={growiTheme}>
        <div id="wrapper" className={classNames.join(' ')} data-color-scheme={colorScheme}>
          {backgroundImageSrc != null && <div className="grw-bg-image-wrapper">
            <Image className='grw-bg-image' alt='background-image' src={backgroundImageSrc} layout='fill' quality="100" />
          </div>}
          {children}
        </div>
      </ThemeProvider>
    </>
  );
};
