import React, { FC } from 'react';

type CountProps = {
  count: number | null | undefined
}

const CountBadge: FC<CountProps> = (props:CountProps) => {
  return (
    <>
      <span className="grw-pagetree-count px-2 badge badge-pill badge-light">
        {props.count}
      </span>
    </>
  );
};

export default CountBadge;
