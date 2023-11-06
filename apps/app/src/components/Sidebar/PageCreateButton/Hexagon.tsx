import React from 'react';

export const Hexagon = React.memo((): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 27.691 23.999"
  >
    <g className="background" transform="translate(0 0)">
      <path d="M20.768,0l6.923,12L20.768,24H6.923L0,12,6.923,0Z" transform="translate(0)"></path>
    </g>
    <g className="icon" transform="translate(10 6)">
      { /* eslint-disable-next-line max-len */ }
      <path d="M2.124,9.114l5.28,5.34a.647.647,0,0,0,.922,0l.616-.623a.665.665,0,0,0,0-.932L4.759,8.648,8.943,4.4a.665.665,0,0,0,0-.932l-.616-.623a.647.647,0,0,0-.922,0l-5.28,5.34A.665.665,0,0,0,2.124,9.114Z" transform="translate(-1.933 -2.648)"></path>
    </g>
  </svg>
));
