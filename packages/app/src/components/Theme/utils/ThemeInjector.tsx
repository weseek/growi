
import React from 'react';

import { useIsomorphicLayoutEffect } from 'usehooks-ts';

type Props = {
  children: JSX.Element,
  bodyTagClassName?: string,
  className?: string,
  bgImageNode?: React.ReactNode,
}

export const ThemeInjector = ({
  children, bodyTagClassName, className: childrenClassName, bgImageNode,
}: Props): JSX.Element => {
  const className = `${children.props.className ?? ''} ${childrenClassName ?? ''}`;

  // add class name to <body>
  useIsomorphicLayoutEffect(() => {
    if (bodyTagClassName != null) {
      document.body.classList.add(bodyTagClassName);
    }

    // clean up
    return () => {
      if (bodyTagClassName != null) {
        document.body.classList.remove(bodyTagClassName);
      }
    };
  });

  return React.cloneElement(children, { className }, [
    <div key="grw-bg-image-wrapper" className="grw-bg-image-wrapper">{bgImageNode}</div>,
    children.props.children,
  ]);
};
