import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminLdapSecurityContainer from '../../../services/AdminLdapSecurityContainer';

import LdapSecuritySettingContents from './LdapSecuritySettingContents';

function LdapSecuritySetting(props) {

  const { adminLdapSecurityContainer } = props;
  if (adminLdapSecurityContainer.state.serverUrl === adminLdapSecurityContainer.dummyServerUrl) {
    throw new Promise(async() => {
      try {
        await adminLdapSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        toastError(err);
        adminLdapSecurityContainer.setState({ retrieveError: err.message });
      }
    });
  }

  return <LdapSecuritySettingContents />;
}

LdapSecuritySetting.propTypes = {
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,
};

const LdapSecuritySettingWithUnstatedContainer = withUnstatedContainers(LdapSecuritySetting, [
  AdminLdapSecurityContainer,
]);

function LdapSecuritySettingWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <LdapSecuritySettingWithUnstatedContainer />
    </Suspense>
  );
}


export default LdapSecuritySettingWithContainerWithSuspense;
