/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

import AdminGitHubSecurityContainer from '../../../services/AdminGitHubSecurityContainer';

import GitHubSecuritySettingContents from './GitHubSecuritySettingContents';

let retrieveErrors = null;
function GitHubSecurityManagement(props) {
  const { adminGitHubSecurityContainer } = props;
  if (adminGitHubSecurityContainer.state.githubClientId === adminGitHubSecurityContainer.dummyGithubClientId) {
    throw (async() => {
      try {
        await adminGitHubSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminGitHubSecurityContainer.setState({ githubClientId: adminGitHubSecurityContainer.dummyGithubClientIdForError });
      }
    })();
  }

  if (adminGitHubSecurityContainer.state.githubClientId === adminGitHubSecurityContainer.dummyGithubClientIdForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
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
