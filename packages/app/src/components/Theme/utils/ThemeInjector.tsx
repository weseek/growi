
import React from 'react';

type Props = {
  children: JSX.Element,
  className: string,
}

export const ThemeInjector = ({ children, className: themeClassName }: Props): JSX.Element => {
  const className = `${children.props.className ?? ''} ${themeClassName}`;
  return React.cloneElement(<div>{children}</div>, { className });
};
