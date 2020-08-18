/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminOidcSecurityContainer from '../../../services/AdminOidcSecurityContainer';

import OidcSecurityManagementContents from './OidcSecuritySettingContents';

function OidcSecurityManagement(props) {

  const { adminOidcSecurityContainer } = props;
  if (adminOidcSecurityContainer.state.oidcProviderName === adminOidcSecurityContainer.dummyOidcProviderName) {
    throw (async() => {
      try {
        await adminOidcSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminOidcSecurityContainer.setState({ oidcProviderName: adminOidcSecurityContainer.dummyOidcProviderNameForError, retrieveError: err[0].message });
      }
    })();
  }

  if (adminOidcSecurityContainer.state.oidcProviderName === adminOidcSecurityContainer.dummyOidcProviderNameForError) {
    throw new Error(adminOidcSecurityContainer.state.retrieveError);
  }

  return <OidcSecurityManagementContents />;
}

OidcSecurityManagement.propTypes = {
  adminOidcSecurityContainer: PropTypes.instanceOf(AdminOidcSecurityContainer).isRequired,
};

const OidcSecurityManagementWithUnstatedContainer = withUnstatedContainers(OidcSecurityManagement, [
  AdminOidcSecurityContainer,
]);

function OidcSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <OidcSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default OidcSecurityManagementWithContainerWithSuspense;
