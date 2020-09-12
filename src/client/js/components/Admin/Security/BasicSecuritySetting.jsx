/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../../SuspenseUtils';

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

const BasicSecurityManagementWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(BasicSecurityManagement), [
  AdminBasicSecurityContainer,
]);

export default BasicSecurityManagementWithUnstatedContainer;
