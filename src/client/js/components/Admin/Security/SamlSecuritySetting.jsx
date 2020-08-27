/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

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

const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(SamlSecurityManagement, [
  AdminSamlSecurityContainer,
]);

function SamlSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <SamlSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default SamlSecurityManagementWithContainerWithSuspense;
