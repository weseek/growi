import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminSamlSecurityContainer from '~/client/services/AdminSamlSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import SamlSecuritySettingContents from './SamlSecuritySettingContents';

function SamlSecurityManagement(props) {
  const { adminSamlSecurityContainer } = props;

  useEffect(() => {
    const fetchSamlSecuritySettingsData = async() => {
      await adminSamlSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchSamlSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminSamlSecurityContainer]);

  return <SamlSecuritySettingContents />;
}

SamlSecurityManagement.propTypes = {
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(SamlSecurityManagement, [
  AdminSamlSecurityContainer,
]);

export default SamlSecurityManagementWithUnstatedContainer;
