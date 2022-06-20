import React, { useEffect } from 'react';

import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

function getURLQueryParamValue(key: string) {
// window.location.href is page URL;
  const queryStr: URLSearchParams = new URL(window.location.href).searchParams;
  return queryStr.get(key);
}

const queryCompareFormat = new RegExp(/([a-z0-9]){24}...([a-z0-9]){24}/);

const ShowPageAccessoriesModal = (): JSX.Element => {
  const { open: openPageAccessories } = usePageAccessoriesModal();
  useEffect(() => {
    const pageIdParams = getURLQueryParamValue('compare');
    if (pageIdParams != null) {
      if (queryCompareFormat.test(pageIdParams)) {
        openPageAccessories(PageAccessoriesModalContents.PageHistory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

export default ShowPageAccessoriesModal;
