import React from 'react';

import { useImageEditorModal } from '~/stores/modal';

type Props = {
  src: string
  alt: string
}

export const ImageEditor = (props: Props): JSX.Element => {
  const { src, alt } = props;

  const { open: openImageEditorModal } = useImageEditorModal();

  return (
    <>
      <img src={src} alt={alt} onClick={() => openImageEditorModal()} />
    </>
  );
};
