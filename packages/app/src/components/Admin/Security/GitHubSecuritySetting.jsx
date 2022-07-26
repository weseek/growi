import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';


import GitHubSecuritySettingContents from './GitHubSecuritySettingContents';

function GitHubSecurityManagement(props) {
  const { adminGitHubSecurityContainer } = props;

  useEffect(() => {
    const fetchGitHubSecuritySettingsData = async() => {
      await adminGitHubSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchGitHubSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
    }
  }, [adminGitHubSecurityContainer]);

  return <GitHubSecuritySettingContents />;
}


GitHubSecurityManagement.propTypes = {
  adminGitHubSecurityContainer: PropTypes.instanceOf(AdminGitHubSecurityContainer).isRequired,
};

const GitHubSecurityManagementWithUnstatedContainer = withUnstatedContainers(GitHubSecurityManagement, [
  AdminGitHubSecurityContainer,
]);

export default GitHubSecurityManagementWithUnstatedContainer;
