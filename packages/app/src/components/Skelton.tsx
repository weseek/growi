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

  const style = {
    width,
    height,
  };

  return <div style={style} className={`grw-skelton ${additionalClass} ${roundedPill ? 'rounded-pill' : ''}`}></div>;
};
