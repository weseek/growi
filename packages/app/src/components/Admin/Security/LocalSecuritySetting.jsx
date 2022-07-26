import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminLocalSecurityContainer from '~/client/services/AdminLocalSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import LocalSecuritySettingContents from './LocalSecuritySettingContents';

function LocalSecuritySetting(props) {
  const { adminLocalSecurityContainer } = props;

  useEffect(() => {
    const fetchLocalSecuritySettingsData = async() => {
      await adminLocalSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchLocalSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminLocalSecurityContainer]);

  return <LocalSecuritySettingContents />;
}

LocalSecuritySetting.propTypes = {
  adminLocalSecurityContainer: PropTypes.instanceOf(AdminLocalSecurityContainer).isRequired,
};

const LocalSecuritySettingWithUnstatedContainer = withUnstatedContainers(LocalSecuritySetting, [
  AdminLocalSecurityContainer,
]);

export default LocalSecuritySettingWithUnstatedContainer;
