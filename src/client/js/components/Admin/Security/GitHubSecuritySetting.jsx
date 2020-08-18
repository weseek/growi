/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminGitHubSecurityContainer from '../../../services/AdminGitHubSecurityContainer';

import GitHubSecuritySettingContents from './GitHubSecuritySettingContents';

let retrieveError = null;
function GitHubSecurityManagement(props) {
  const { adminGitHubSecurityContainer } = props;
  if (adminGitHubSecurityContainer.state.githubClientId === adminGitHubSecurityContainer.dummyGithubClientId) {
    throw (async() => {
      try {
        await adminGitHubSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        retrieveError = err;
        adminGitHubSecurityContainer.setState({ githubClientId: adminGitHubSecurityContainer.dummyGithubClientIdForError });
      }
    })();
  }

  if (adminGitHubSecurityContainer.state.githubClientId === adminGitHubSecurityContainer.dummyGithubClientIdForError) {
    throw new Error(retrieveError[0].message);
  }

  return <GitHubSecuritySettingContents />;
}


GitHubSecurityManagement.propTypes = {
  adminGitHubSecurityContainer: PropTypes.instanceOf(AdminGitHubSecurityContainer).isRequired,
};

const GitHubSecurityManagementWithUnstatedContainer = withUnstatedContainers(GitHubSecurityManagement, [
  AdminGitHubSecurityContainer,
]);

function GitHubSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <GitHubSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default GitHubSecurityManagementWithContainerWithSuspense;
