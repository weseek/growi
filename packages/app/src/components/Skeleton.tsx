import React from 'react';

type SkeletonProps = {
  additionalClass?: string,
  roundedPill?: boolean,
}

export const Skeleton = (props: SkeletonProps): JSX.Element => {
  const {
    additionalClass, roundedPill,
  } = props;

  return (
    <div className={`${additionalClass ?? ''}`}>
      <div className={`grw-skeleton h-100 w-100 ${roundedPill && 'rounded-pill'}`}></div>
    </div>
  );
};
