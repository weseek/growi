/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

import BasicSecurityManagementContents from './BasicSecuritySettingContents';

function BasicSecurityManagement(props) {
  const { adminBasicSecurityContainer } = props;
  if (adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser === adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUser) {
    throw new Promise(async() => {
      try {
        await adminBasicSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        adminBasicSecurityContainer.setState({ retrieveError: err.message });
        toastError(err);
      }
    });
  }

  return <BasicSecurityManagementContents />;
}

BasicSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminBasicSecurityContainer: PropTypes.instanceOf(AdminBasicSecurityContainer).isRequired,
};

const BasicSecurityManagementWithUnstatedContainer = withUnstatedContainers(BasicSecurityManagement, [
  AdminGeneralSecurityContainer,
  AdminBasicSecurityContainer,
]);

function BasicSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <BasicSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default BasicSecurityManagementWithContainerWithSuspense;
