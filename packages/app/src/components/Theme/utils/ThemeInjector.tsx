
import React from 'react';

import { useIsomorphicLayoutEffect } from 'usehooks-ts';

type Props = {
  children: JSX.Element,
  className: string,
  bgImageNode?: React.ReactNode,
}

export const ThemeInjector = ({ children, className: themeClassName, bgImageNode }: Props): JSX.Element => {
  const className = `${children.props.className ?? ''} ${themeClassName}`;

  // add class name to <body>
  useIsomorphicLayoutEffect(() => {
    document.body.classList.add(themeClassName);

    // clean up
    return () => {
      document.body.classList.remove(themeClassName);
    };
  });

  return React.cloneElement(children, { className }, [
    <div key="grw-bg-image-wrapper" className="grw-bg-image-wrapper">{bgImageNode}</div>,
    children.props.children,
  ]);
};
