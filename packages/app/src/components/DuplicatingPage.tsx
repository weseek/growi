import React, { FC } from 'react';
import DuplicatingPageSubnavigation from './Duplication/DuplicatingPageSubNavigation';
import DuplicatedAlert from './Duplication/DuplicationAlert';
// import { useTranslation } from 'react-i18next';
// import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
// import { toastSuccess, toastError } from '../client/util/apiNotification';

// interface Props {

// }

const DuplicatingPage: FC = (props) => {
  const newProps = {
    pageId: '',
    path: '/Sandbox',
  };
  return (
    <>
      <DuplicatingPageSubnavigation {...newProps} />
      <div className="duplicate-content">
        <DuplicatedAlert path={newProps.path} />
        {/* add page list */}
      </div>
    </>
  );

};

export default DuplicatingPage;
