import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminGoogleSecurityContainer from '~/client/services/AdminGoogleSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import GoogleSecurityManagementContents from './GoogleSecuritySettingContents';

function GoogleSecurityManagement(props) {
  const { adminGoogleSecurityContainer } = props;

  useEffect(() => {
    const fetchGoogleSecuritySettingsData = async() => {
      await adminGoogleSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchGoogleSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminGoogleSecurityContainer]);

  return <GoogleSecurityManagementContents />;
}


GoogleSecurityManagement.propTypes = {
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWithUnstatedContainer = withUnstatedContainers(GoogleSecurityManagement, [
  AdminGoogleSecurityContainer,
]);

export default GoogleSecurityManagementWithUnstatedContainer;
