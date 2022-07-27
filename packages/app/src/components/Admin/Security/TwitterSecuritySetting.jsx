import React, { useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';

import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import TwitterSecuritySettingContents from './TwitterSecuritySettingContents';

const TwitterSecurityManagement = (props) => {
  const { adminTwitterSecurityContainer } = props;

  const fetchTwitterSecuritySettingsData = useCallback(async() => {
    try {
      await adminTwitterSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
    }
  }, [adminTwitterSecurityContainer]);

  useEffect(() => {
    fetchTwitterSecuritySettingsData();
  }, [adminTwitterSecurityContainer, fetchTwitterSecuritySettingsData]);

  return <TwitterSecuritySettingContents />;
};

TwitterSecurityManagement.propTypes = {
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementWithUnstatedContainer = withUnstatedContainers(TwitterSecurityManagement, [
  AdminTwitterSecurityContainer,
]);

export default TwitterSecurityManagementWithUnstatedContainer;
