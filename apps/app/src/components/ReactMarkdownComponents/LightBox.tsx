import React, { useState } from 'react';

import FsLightbox from 'fslightbox-react';

export const LightBox = (props) => {
  const [toggler, setToggler] = useState(false);
  return (
    <>
      <img {...props.node.properties} onClick={() => setToggler(!toggler)}/>
      <FsLightbox
        toggler={toggler}
        sources={[props.src]}
      />
    </>
  );
};
