import React, { useState } from 'react';

import FsLightbox from 'fslightbox-react';

export const LightBox = ({ node, ...props }) => {
  const [toggler, setToggler] = useState(false);
  return (
    <>
      <img src={props.src} alt={props.alt} onClick={() => setToggler(!toggler)}/>
      <FsLightbox
        toggler={toggler}
        sources={[props.src]}
      />
    </>
  );
};
