/* eslint-disable react/no-danger */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminLocalSecurityContainer from '../../../services/AdminLocalSecurityContainer';

import LocalSecuritySettingContents from './LocalSecuritySettingContents';

function LocalSecuritySetting(props) {

  const { adminLocalSecurityContainer } = props;
  if (adminLocalSecurityContainer.state.registrationMode === adminLocalSecurityContainer.dummyRegistrationMode) {
    throw new Promise(async() => {
      try {
        await adminLocalSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminLocalSecurityContainer.setState({ retrieveError: err.message });
      }
    });
  }

  return <LocalSecuritySettingContents />;
}

LocalSecuritySetting.propTypes = {
  adminLocalSecurityContainer: PropTypes.instanceOf(AdminLocalSecurityContainer).isRequired,
};

const LocalSecuritySettingWithUnstatedContainer = withUnstatedContainers(LocalSecuritySetting, [
  AdminLocalSecurityContainer,
]);

function LocalSecuritySettingWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
)}
    >
      <LocalSecuritySettingWithUnstatedContainer />
    </Suspense>
  );
}

export default LocalSecuritySettingWithContainerWithSuspense;
