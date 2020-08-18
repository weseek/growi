/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminTwitterSecurityContainer from '../../../services/AdminTwitterSecurityContainer';

import TwitterSecuritySettingContents from './TwitterSecuritySettingContents';

let retrieveError = null;
function TwitterSecurityManagement(props) {
  const { adminTwitterSecurityContainer } = props;
  if (adminTwitterSecurityContainer.state.twitterConsumerKey === adminTwitterSecurityContainer.dummyTwitterConsumerKey) {
    throw (async() => {
      try {
        await adminTwitterSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminTwitterSecurityContainer.setState({
          twitterConsumerKey: adminTwitterSecurityContainer.dummyTwitterConsumerKeyForError,
        });
        retrieveError = err;
      }
    })();
  }

  if (adminTwitterSecurityContainer.state.twitterConsumerKey === adminTwitterSecurityContainer.dummyTwitterConsumerKeyForError) {
    throw new Error(retrieveError[0].message);
  }

  return <TwitterSecuritySettingContents />;
}

TwitterSecurityManagement.propTypes = {
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementWithUnstatedContainer = withUnstatedContainers(TwitterSecurityManagement, [
  AdminTwitterSecurityContainer,
]);

function TwitterSecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <TwitterSecurityManagementWithUnstatedContainer />
    </Suspense>
  );
}

export default TwitterSecurityManagementWithContainerWithSuspense;
