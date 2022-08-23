
import React from 'react';

type Props = {
  children: JSX.Element,
  className: string,
}

export const ThemeInjector = ({ children, className: themeClassName }: Props): JSX.Element => {
  const className = `${children.props.className ?? ''} ${themeClassName}`;
  const newChildren = React.cloneElement(children, { className });
  return <div className={`${newChildren.props.className}`}>{newChildren}</div>;
};
