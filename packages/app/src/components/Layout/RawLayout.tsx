import React, {
  ReactNode, useCallback, useEffect, useState,
} from 'react';

import Head from 'next/head';
import Image from 'next/image';

import { useGrowiTheme } from '~/stores/context';
import { Themes, useNextThemes } from '~/stores/use-next-themes';

import { getBackgroundImageSrc } from '../Theme/utils/ThemeImageProvider';
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
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | undefined>(undefined);

  // set colorScheme in CSR
  useEffect(() => {
    setColorScheme(resolvedTheme as Themes);
  }, [resolvedTheme]);

  // set background image
  useEffect(() => {
    const imgSrc = getBackgroundImageSrc(growiTheme, colorScheme);
    setBackgroundImageSrc(imgSrc);
  }, [growiTheme, colorScheme]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider theme={growiTheme}>
        <div className={classNames.join(' ')} data-color-scheme={colorScheme}>
          {backgroundImageSrc != null && <div className="grw-bg-image-wrapper">
            <Image className='grw-bg-image' alt='background-image' src={backgroundImageSrc} layout='fill' quality="100" />
          </div>}
          {children}
        </div>
      </ThemeProvider>
    </>
  );
};
