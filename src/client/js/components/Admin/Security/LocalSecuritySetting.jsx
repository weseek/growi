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
    throw (async() => {
      try {
        await adminLocalSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminLocalSecurityContainer.setState({ registrationMode: adminLocalSecurityContainer.dummyRegistrationModeForError, retrieveError: err[0].message });
      }
    })();
  }

  if (adminLocalSecurityContainer.state.registrationMode === adminLocalSecurityContainer.dummyRegistrationModeForError) {
    throw new Error(adminLocalSecurityContainer.state.retrieveError);
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
