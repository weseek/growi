import React, { useEffect, useState } from 'react';

import { usePageAccessoriesModal, PageAccessoriesModalContents } from '~/stores/modal';

function getURLQueryParamValue(key: string) {
// window.location.href is page URL;
  const queryStr: URLSearchParams = new URL(window.location.href).searchParams;
  return queryStr.get(key);
}

const queryCompareFormat = new RegExp(/([a-z0-9]){24}...([a-z0-9]){24}/);

const ShowPageAccessoriesModal = (): JSX.Element => {
  const { data: status, open: openPageAccessories } = usePageAccessoriesModal();
  const [isOpenDone, setIsOpenDone] = useState(false);
  useEffect(() => {
    const pageIdParams = getURLQueryParamValue('compare');
    if (status == null || status.isOpened === true) {
      return;
    }
    if (isOpenDone === true) {
      return;
    }
    if (pageIdParams != null) {
      if (queryCompareFormat.test(pageIdParams)) {
        openPageAccessories(PageAccessoriesModalContents.PageHistory);
        setIsOpenDone(true);
      }
    }
  }, [openPageAccessories, status, isOpenDone]);
  return <></>;
};

export default ShowPageAccessoriesModal;
