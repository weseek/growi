import React from 'react';

import { useImageEditorModal } from '~/stores/modal';

export const ImageEditor = (props) => {
  const { ...rest } = props;

  const { open: openImageEditorModal } = useImageEditorModal();

  return (
    <>
      <img {...rest} onClick={() => openImageEditorModal()} />
    </>
  );
};
