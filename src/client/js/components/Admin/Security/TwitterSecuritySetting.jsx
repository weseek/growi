/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminTwitterSecurityContainer from '../../../services/AdminTwitterSecurityContainer';

import TwitterSecuritySettingContents from './TwitterSecuritySettingContents';

let retrieveErrors = null;
function TwitterSecurityManagement(props) {
  const { adminTwitterSecurityContainer } = props;
  if (adminTwitterSecurityContainer.state.twitterConsumerKey === adminTwitterSecurityContainer.dummyTwitterConsumerKey) {
    throw (async() => {
      try {
        await adminTwitterSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminTwitterSecurityContainer.setState({
          twitterConsumerKey: adminTwitterSecurityContainer.dummyTwitterConsumerKeyForError,
        });
      }
    })();
  }

  if (adminTwitterSecurityContainer.state.twitterConsumerKey === adminTwitterSecurityContainer.dummyTwitterConsumerKeyForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <TwitterSecuritySettingContents />;
}

TwitterSecurityManagement.propTypes = {
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(TwitterSecurityManagement), [
  AdminTwitterSecurityContainer,
]);

export default TwitterSecurityManagementWithUnstatedContainer;
