
import dynamic from 'next/dynamic';
import React from 'react';

const ThemeDefault = dynamic(() => import('./ThemeDefault'));

type Props = {
  children: JSX.Element,
  theme: string,
}

export const ThemeProvider = ({ theme, children }: Props): JSX.Element => {
  return <ThemeDefault>{children}</ThemeDefault>;
}
