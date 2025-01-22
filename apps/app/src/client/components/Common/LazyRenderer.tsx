import React, { useEffect, useState } from 'react';

type Props = {
  shouldRender: boolean | (() => boolean),
  children: React.ReactElement,
}

export const LazyRenderer = (props: Props): React.ReactElement => {
  const { shouldRender: _shouldRender, children } = props;

  const [isActivated, setActivated] = useState(false);

  const shouldRender = typeof _shouldRender === 'function'
    ? _shouldRender()
    : _shouldRender;

  useEffect(() => {
    if (isActivated) {
      return;
    }
    setActivated(shouldRender);
  }, [isActivated, shouldRender]);

  if (!isActivated) {
    return <></>;
  }

  const child = React.Children.only(children);

  return React.cloneElement(child, { visibility: shouldRender });

};
