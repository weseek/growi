/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

import AdminBasicSecurityContainer from '../../../services/AdminBasicSecurityContainer';

import BasicSecurityManagementContents from './BasicSecuritySettingContents';

let retrieveErrors = null;
function BasicSecurityManagement(props) {
  const { adminBasicSecurityContainer } = props;
  if (adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser === adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUser) {
    throw (async() => {
      try {
        await adminBasicSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminBasicSecurityContainer.setState({
          isSameUsernameTreatedAsIdenticalUser: adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUser,
        });

      }
    })();
  }

  if (
    adminBasicSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser === adminBasicSecurityContainer.dummyIsSameUsernameTreatedAsIdenticalUserForError
  ) {
    throw new Error(`${retrieveErrors.length} errors occured`);
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
