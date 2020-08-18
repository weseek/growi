/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

import BasicSecurityManagementContents from './BasicSecuritySettingContents';

function BasicSecurityManagement(props) {
  const { adminBasicSecurityContainer } = props;
  if (adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser === adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUser) {
    throw (async() => {
      try {
        await adminBasicSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        adminBasicSecurityContainer.setState({
          isSameUsernameTreatedAsIdenticalUser: adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUser,
          retrieveError: err.message,
        });
        toastError(err);
      }
    })();
  }

  if (
    adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser === adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUserForError
  ) {
    throw new Error(adminBasicSecurityContainer.state.retrieveError);
  }

  return <BasicSecurityManagementContents />;
}

BasicSecurityManagement.propTypes = {
  adminBasicSecurityContainer: PropTypes.instanceOf(AdminBasicSecurityContainer).isRequired,
};

const BasicSecurityManagementWithUnstatedContainer = withUnstatedContainers(BasicSecurityManagement, [
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
