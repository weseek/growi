import React, { useState } from 'react';

export const ImageEditor = (props) => {
  const { node, ...rest } = props;
  const [toggler, setToggler] = useState(false);

  return (
    <>
      <img {...rest} onClick={() => setToggler(!toggler)} />
    </>
  );
};
