
import React from 'react';

import dynamic from 'next/dynamic';

const ThemeDefault = dynamic(() => import('./ThemeDefault'));

type Props = {
  children: JSX.Element,
  theme: string,
}

export const ThemeProvider = ({ theme, children }: Props): JSX.Element => {
  return <ThemeDefault>{children}</ThemeDefault>;
};
