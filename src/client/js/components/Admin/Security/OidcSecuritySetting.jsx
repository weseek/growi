/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

import AdminOidcSecurityContainer from '../../../services/AdminOidcSecurityContainer';

import OidcSecurityManagementContents from './OidcSecuritySettingContents';

let retrieveErrors = null;
function OidcSecurityManagement(props) {
  const { adminOidcSecurityContainer } = props;
  if (adminOidcSecurityContainer.state.oidcProviderName === adminOidcSecurityContainer.dummyOidcProviderName) {
    throw (async() => {
      try {
        await adminOidcSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminOidcSecurityContainer.setState({ oidcProviderName: adminOidcSecurityContainer.dummyOidcProviderNameForError });
      }
    })();
  }

  if (adminOidcSecurityContainer.state.oidcProviderName === adminOidcSecurityContainer.dummyOidcProviderNameForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
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
