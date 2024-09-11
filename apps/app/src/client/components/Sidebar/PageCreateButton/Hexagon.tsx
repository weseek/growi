import React, { useState } from 'react';

type Props = {
  className?: string;
};

// eslint-disable-next-line react/prop-types
export const Hexagon: React.FC<Props> = React.memo(({ className }) => {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const pathStyle = {
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transformOrigin: 'center' as const,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 27.691 23.999"
      height="36px"
      className={className}
    >
      <g className="background">
        <path
          d="M20.768,0l6.923,12L20.768,24H6.923L0,12,6.923,0Z"
          style={pathStyle}
          onMouseEnter={onMouseEnterHandler}
          onMouseLeave={onMouseLeaveHandler}
        />
      </g>
    </svg>
  );
});
