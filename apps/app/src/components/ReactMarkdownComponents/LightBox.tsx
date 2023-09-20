import React, { useState } from 'react';

import FsLightbox from 'fslightbox-react';

export const LightBox = (props) => {
  const [toggler, setToggler] = useState(false);
  const { node, ...rest } = props;

  return (
    <>
      <img {...rest} onClick={() => setToggler(!toggler)} />
      <FsLightbox
        toggler={toggler}
        sources={[props.src]}
        type="image"
      />
    </>
  );
};
