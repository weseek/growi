import React, { useState } from 'react';

import PageList from './PageList/PageList';

import { useSWRxPageList } from '~/stores/page';


type Props = {
  path: string,
}

const DescendantsPageList = (props: Props): JSX.Element => {
  const { path } = props;

  const [activePage, setActivePage] = useState(1);

  const { data, error: error } = useSWRxPageList(path, activePage);

  function setPageNumber(selectedPageNumber) {
    setActivePage(selectedPageNumber);
  }

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  return (
    <PageList pages={data} />
  );
};

export default DescendantsPageList;
