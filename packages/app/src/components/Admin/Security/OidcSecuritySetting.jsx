import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminOidcSecurityContainer from '~/client/services/AdminOidcSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import OidcSecurityManagementContents from './OidcSecuritySettingContents';

function OidcSecurityManagement(props) {
  const { adminOidcSecurityContainer } = props;

  useEffect(() => {
    const fetchOidcSecuritySettingsData = async() => {
      await adminOidcSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchOidcSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminOidcSecurityContainer]);

  return <OidcSecurityManagementContents />;
}

OidcSecurityManagement.propTypes = {
  adminOidcSecurityContainer: PropTypes.instanceOf(AdminOidcSecurityContainer).isRequired,
};

const OidcSecurityManagementWithUnstatedContainer = withUnstatedContainers(OidcSecurityManagement, [
  AdminOidcSecurityContainer,
]);

export default OidcSecurityManagementWithUnstatedContainer;
