import React from 'react';

import { useImageEditorModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

type Props = {
  src?: string
  alt?: string
}

export const Image = (props: Props): JSX.Element => {
  const { src, alt } = props;

  const { data: currentPage } = useSWRxCurrentPage();
  const { open: openImageEditorModal } = useImageEditorModal();

  if (src == null) {
    return <></>;
  }

  return (
    <>
      <img src={src} alt={alt} onClick={() => openImageEditorModal(src, currentPage?._id, currentPage?.path)} />
    </>
  );
};
