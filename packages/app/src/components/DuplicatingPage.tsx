import React from 'react';
import DuplicatingPageSubnavigation from './Duplication/DuplicatingPageSubNavigation';
// import { useTranslation } from 'react-i18next';
// import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
// import { toastSuccess, toastError } from '../client/util/apiNotification';

// interface Props {

// }

const DuplicatingPage: React.FC = (props) => {
  const newProps = {
    pageId: '61e5964c4783fe61da0d5cdd',
    path: '/Sandbox/Hoge',
  };
  return (
    // add header
    // add alert
    // add page list
    <>
      <DuplicatingPageSubnavigation {...newProps} />
      <div>Duplication Found</div>
    </>
  );

};

export default DuplicatingPage;
