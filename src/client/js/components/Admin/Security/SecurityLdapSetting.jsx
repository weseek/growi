import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminSecurityContainer from '../../../services/AdminSecurityContainer';

class SecurityLdapSetting extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          LDAP { t('security_setting.configuration') }
        </h2>

      </React.Fragment>
    );
  }

}

SecurityLdapSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSecurityContainer: PropTypes.instanceOf(AdminSecurityContainer).isRequired,
};

const SecurityLdapSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLdapSetting, props, [AppContainer, AdminSecurityContainer]);
};

export default withTranslation()(SecurityLdapSettingWrapper);
