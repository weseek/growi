import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminLdapSecurityContainer from '~/client/services/AdminLdapSecurityContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';

import { withUnstatedContainers } from '../../UnstatedUtils';

import LdapSecuritySettingContents from './LdapSecuritySettingContents';

function LdapSecuritySetting(props) {
  const { adminLdapSecurityContainer } = props;

  useEffect(() => {
    const fetchLdapSecuritySettingsData = async() => {
      await adminLdapSecurityContainer.retrieveSecurityData();
    };

    try {
      fetchLdapSecuritySettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
    }
  }, [adminLdapSecurityContainer]);

  return <LdapSecuritySettingContents />;
}

LdapSecuritySetting.propTypes = {
  adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,
};

const LdapSecuritySettingWithUnstatedContainer = withUnstatedContainers(LdapSecuritySetting, [
  AdminLdapSecurityContainer,
]);

export default LdapSecuritySettingWithUnstatedContainer;
