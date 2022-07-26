import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminBasicSecurityContainer from '~/client/services/AdminBasicSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import BasicSecurityManagementContents from './BasicSecuritySettingContents';

const BasicSecurityManagement = (props) => {
  const { adminBasicSecurityContainer } = props

  useEffect(() => {
    const fetchBasicSecuritySettingsData = async() => {
      await adminBasicSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchBasicSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminBasicSecurityContainer]);


  return <BasicSecurityManagementContents />;
}

BasicSecurityManagement.propTypes = {
  adminBasicSecurityContainer: PropTypes.instanceOf(AdminBasicSecurityContainer).isRequired,
};

const BasicSecurityManagementWithUnstatedContainer = withUnstatedContainers(BasicSecurityManagement, [
  AdminBasicSecurityContainer,
]);

export default BasicSecurityManagementWithUnstatedContainer;
