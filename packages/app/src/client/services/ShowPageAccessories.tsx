import React, { useEffect } from 'react';

import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

function hasURLQueryParamValue(key) {
// window.location.href is page URL;
  const queryStr = new URL(window.location.href).searchParams;
  if (queryStr === null) {
    return '';
  }
  if (queryStr.get(key) === null) {
    return '';
  }
  return queryStr.get(key);
}

const ShowPageAccessoriesModal = (): JSX.Element => {
  const { open: openPageAccessories } = usePageAccessoriesModal();
  useEffect(() => {
    if (hasURLQueryParamValue('compare')!.split('...').length > 1) {
      openPageAccessories(PageAccessoriesModalContents.PageHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

export default ShowPageAccessoriesModal;
