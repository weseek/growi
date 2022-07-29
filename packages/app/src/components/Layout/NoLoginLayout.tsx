import Head from 'next/head';
import React, { ReactNode } from 'react';
import { Provider } from 'unstated';
import { useGrowiTheme } from '~/stores/context';
import { useNextThemes } from '~/stores/use-next-themes';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
}

export const NoLoginLayout = ({
  children, title, className
}: Props): JSX.Element => {
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }
  const { data: growiTheme } = useGrowiTheme();

  const { resolvedTheme } = useNextThemes();

  return (
    <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
    </Head>

    </>
  )



}

