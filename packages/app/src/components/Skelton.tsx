import React from 'react';

type SkeltonProps = {
  additionalClass?: string,
  roundedPill?: boolean,
}

export const Skelton = (props: SkeltonProps): JSX.Element => {
  const {
    additionalClass, roundedPill,
  } = props;

  return (
    <div className={`${additionalClass ?? ''}`}>
      <div className={`grw-skelton h-100 w-100 ${roundedPill ?? ''}`}></div>
    </div>
  );
};
