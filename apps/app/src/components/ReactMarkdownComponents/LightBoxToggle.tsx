import React, { useCallback } from 'react';

import { useLightBox } from '~/stores/light-box';


export const LightBoxToggle = (props) => {
  const { ...rest } = props;
  const { lightBoxController } = useLightBox();

  const clickImageHandler = useCallback(async() => {
    lightBoxController(props.src);
  }, [lightBoxController, props.src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...rest} onClick={clickImageHandler} />
  );
};
