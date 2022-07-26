import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import SecurityManagementContents from './SecurityManagementContents';

function SecurityManagement(props) {
  const { adminGeneralSecurityContainer } = props;

  useEffect(() => {
    const fetchGeneralSecuritySettingsData = async() => {
      await adminGeneralSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchGeneralSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminGeneralSecurityContainer]);

  return <SecurityManagementContents />;
}

SecurityManagement.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecurityManagementWithUnstatedContainer = withUnstatedContainers(SecurityManagement, [AdminGeneralSecurityContainer]);

export default SecurityManagementWithUnstatedContainer;
