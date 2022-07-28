import React from 'react';

type SkeltonProps = {
  width?: number,
  height?: number,
  componentClass?: string,
  componentHeight?: number,
  roundedPill?: boolean,
}

export const Skelton = (props: SkeltonProps): JSX.Element => {
  const {
    width, height, componentHeight, componentClass, roundedPill,
  } = props;

  const componentStyle = {
    height: componentHeight,
  };

  const skeltonStyle = {
    width,
    height,
  };

  return (
    <div style={componentStyle} className={`d-flex align-items-center ${componentClass}`}>
      <div style={skeltonStyle} className={`grw-skelton ${roundedPill ? 'rounded-pill' : ''}`}></div>
    </div>
  );
};
