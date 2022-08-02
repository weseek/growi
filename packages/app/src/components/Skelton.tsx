import React from 'react';

type SkeltonProps = {
  width?: number,
  height?: number,
  additionalClass?: string,
  roundedPill?: boolean,
}

export const Skelton = (props: SkeltonProps): JSX.Element => {
  const {
    width, height, additionalClass, roundedPill,
  } = props;

  const skeltonStyle = {
    width,
    height,
  };

  return (
    <div style={skeltonStyle} className={`${additionalClass}`}>
      <div className={`grw-skelton h-100 w-100 ${roundedPill ? 'rounded-pill' : ''}`}></div>
    </div>
  );
};
