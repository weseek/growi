import React from 'react';

import FsLightbox from 'fslightbox-react';

import { useLightBox } from '~/stores/light-box';

export const LightBox: React.FC = () => {
  const { data } = useLightBox();

  if (data == null || data.attachmentId == null) {
    return <></>;
  }

  return (
    <FsLightbox
      toggler={data.toggler}
      sources={[data.attachmentId]}
      type="image"
    />
  );
};
