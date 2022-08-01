import React, { useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import SecurityManagementContents from './SecurityManagementContents';

function SecurityManagement(props) {
  const { adminGeneralSecurityContainer } = props;

  const fetchGeneralSecuritySettingsData = useCallback(async() => {
    try {
      await adminGeneralSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
    }
  }, [adminGeneralSecurityContainer]);

  useEffect(() => {
    fetchGeneralSecuritySettingsData();
  }, [adminGeneralSecurityContainer, fetchGeneralSecuritySettingsData]);

  return <SecurityManagementContents />;
}

SecurityManagement.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecurityManagementWithUnstatedContainer = withUnstatedContainers(SecurityManagement, [AdminGeneralSecurityContainer]);

export default SecurityManagementWithUnstatedContainer;
