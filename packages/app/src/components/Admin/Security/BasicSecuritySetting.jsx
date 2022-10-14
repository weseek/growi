import React, { useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';

import AdminBasicSecurityContainer from '~/client/services/AdminBasicSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import BasicSecurityManagementContents from './BasicSecuritySettingContents';

const BasicSecurityManagement = (props) => {
  const { adminBasicSecurityContainer } = props;

  const fetchBasicSecuritySettingsData = useCallback(async() => {
    try {
      await adminBasicSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
    }
  }, [adminBasicSecurityContainer]);

  useEffect(() => {
    fetchBasicSecuritySettingsData();
  }, [adminBasicSecurityContainer, fetchBasicSecuritySettingsData]);


  return <BasicSecurityManagementContents />;
};

BasicSecurityManagement.propTypes = {
  adminBasicSecurityContainer: PropTypes.instanceOf(AdminBasicSecurityContainer).isRequired,
};

const BasicSecurityManagementWithUnstatedContainer = withUnstatedContainers(BasicSecurityManagement, [
  AdminBasicSecurityContainer,
]);

export default BasicSecurityManagementWithUnstatedContainer;
