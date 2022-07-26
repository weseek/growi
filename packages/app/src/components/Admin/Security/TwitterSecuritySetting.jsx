import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import TwitterSecuritySettingContents from './TwitterSecuritySettingContents';

function TwitterSecurityManagement(props) {
  const { adminTwitterSecurityContainer } = props;

  useEffect(() => {
    const fetchTwitterSecuritySettingsData = async() => {
      await adminTwitterSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchTwitterSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminTwitterSecurityContainer]);

  return <TwitterSecuritySettingContents />;
}

TwitterSecurityManagement.propTypes = {
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementWithUnstatedContainer = withUnstatedContainers(TwitterSecurityManagement, [
  AdminTwitterSecurityContainer,
]);

export default TwitterSecurityManagementWithUnstatedContainer;
