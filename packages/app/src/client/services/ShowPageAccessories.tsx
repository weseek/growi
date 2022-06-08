import React, { useEffect } from 'react';

import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

function getURLQueryParamValue(key: string): string | null {
// window.location.href is page URL;
  const queryStr: URLSearchParams = new URL(window.location.href).searchParams;
  return queryStr.get(key);
}

const ShowPageAccessoriesModal = (): JSX.Element => {
  const { open: openPageAccessories } = usePageAccessoriesModal();
  useEffect(() => {
    const pageIdParams = getURLQueryParamValue('compare');
    if (pageIdParams != null) {
      if (/([a-z]|[0-9]){24}\.{3}([a-z]|[0-9]){24}/.test(pageIdParams)) {
        openPageAccessories(PageAccessoriesModalContents.PageHistory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

export default ShowPageAccessoriesModal;
