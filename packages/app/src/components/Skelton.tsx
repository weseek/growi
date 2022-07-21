import React from 'react';

import styles from './Skelton.module.scss';

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

  return <div style={style} className={`${styles['grw-skelton']} ${additionalClass} ${roundedPill ? 'rounded-pill' : ''}`}></div>;
};
