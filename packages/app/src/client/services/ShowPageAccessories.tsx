import React, { useEffect } from 'react';

import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

function getURLQueryParamValue(key: string): string | null {
// window.location.href is page URL;
  const queryStr: URLSearchParams = new URL(window.location.href).searchParams;
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
    if (getURLQueryParamValue('compare')!.split('...').length > 1) {
      openPageAccessories(PageAccessoriesModalContents.PageHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

export default ShowPageAccessoriesModal;
