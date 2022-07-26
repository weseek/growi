/* eslint-disable react/no-danger */
import React from 'react';

import PropTypes from 'prop-types';

import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import SamlSecuritySettingContents from './SamlSecuritySettingContents';

let retrieveErrors = null;
function SamlSecurityManagement(props) {
  const { adminSamlSecurityContainer } = props;
  // if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPoint) {
  //   throw (async() => {
  //     try {
  //       await adminSamlSecurityContainer.retrieveSecurityData();
  //     }
  //     catch (err) {
  //       const errs = toArrayIfNot(err);
  //       toastError(errs);
  //       retrieveErrors = errs;
  //       adminSamlSecurityContainer.setState({ samlEntryPoint: adminSamlSecurityContainer.dummySamlEntryPointForError });
  //     }
  //   })();
  // }

  // if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPointForError) {
  //   throw new Error(`${retrieveErrors.length} errors occured`);
  // }

  return <SamlSecuritySettingContents />;
}

SamlSecurityManagement.propTypes = {
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(SamlSecurityManagement, [
  AdminSamlSecurityContainer,
]);

export default SamlSecurityManagementWithUnstatedContainer;
