/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

import SamlSecuritySettingContents from './SamlSecuritySettingContents';

let retrieveErrors = null;
function SamlSecurityManagement(props) {
  const { adminSamlSecurityContainer } = props;
  if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPoint) {
    throw (async() => {
      try {
        await adminSamlSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminSamlSecurityContainer.setState({ samlEntryPoint: adminSamlSecurityContainer.dummySamlEntryPointForError });
      }
    })();
  }

  if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPointForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <SamlSecuritySettingContents />;
}

SamlSecurityManagement.propTypes = {
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(SamlSecurityManagement), [
  AdminSamlSecurityContainer,
]);

export default SamlSecurityManagementWithUnstatedContainer;
