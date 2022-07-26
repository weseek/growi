/* eslint-disable react/no-danger */
import React from 'react';

import PropTypes from 'prop-types';

import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import GoogleSecurityManagementContents from './GoogleSecuritySettingContents';

let retrieveErrors = null;
function GoogleSecurityManagement(props) {
  const { adminGoogleSecurityContainer } = props;
  // if (adminGoogleSecurityContainer.state.googleClientId === adminGoogleSecurityContainer.dummyGoogleClientId) {
  //   throw (async() => {
  //     try {
  //       await adminGoogleSecurityContainer.retrieveSecurityData();
  //     }
  //     catch (err) {
  //       const errs = toArrayIfNot(err);
  //       toastError(errs);
  //       retrieveErrors = errs;
  //       adminGoogleSecurityContainer.setState({ googleClientId: adminGoogleSecurityContainer.dummyGoogleClientIdForError });
  //     }
  //   })();
  // }

  // if (adminGoogleSecurityContainer.state.googleClientId === adminGoogleSecurityContainer.dummyGoogleClientIdForError) {
  //   throw new Error(`${retrieveErrors.length} errors occured`);
  // }

  return <GoogleSecurityManagementContents />;
}


GoogleSecurityManagement.propTypes = {
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWithUnstatedContainer = withUnstatedContainers(GoogleSecurityManagement, [
  AdminGoogleSecurityContainer,
]);

export default GoogleSecurityManagementWithUnstatedContainer;
