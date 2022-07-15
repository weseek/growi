
import React from 'react';

type Props = {
  children: JSX.Element,
  themeStyles: { readonly [key: string]: string },
}

export const ThemeInjector = ({ themeStyles, children }: Props): JSX.Element => {
  const className = `${children.props.className ?? ''} ${themeStyles['theme']}`;
  return React.cloneElement(children, { className });
}
