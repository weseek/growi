import React, { FC } from 'react';

type CountProps = {
  count: number
}

const CountBadge: FC<CountProps> = (props:CountProps) => {
  return (
    <>
      <span className="grw-count-badge px-2 badge badge-pill badge-light">
        {props.count}
      </span>
    </>
  );
};

export default CountBadge;
