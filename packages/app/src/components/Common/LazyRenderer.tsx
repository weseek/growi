import React, { useEffect, useState } from 'react';

type Props = {
  shouldRender: boolean | (() => boolean),
  children: JSX.Element,
}

export const LazyRenderer = (props: Props): JSX.Element => {
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

  const additionalClassName = shouldRender ? '' : 'd-none';

  if (!isActivated) {
    return <></>;
  }

  return (
    <>
      { React.cloneElement(children, {
        className: `${children.props.className ?? ''} ${additionalClassName}`,
      }) }
    </>
  );
};
