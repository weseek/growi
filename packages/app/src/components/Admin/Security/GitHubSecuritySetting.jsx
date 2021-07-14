/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

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

const GitHubSecurityManagementWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(GitHubSecurityManagement), [
  AdminGitHubSecurityContainer,
]);

export default GitHubSecurityManagementWithUnstatedContainer;
