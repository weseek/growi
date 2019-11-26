import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';


class SamlSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    return (
      <React.Fragment>

        {adminGeneralSecurityContainer.state.useOnlyEnvVarsForSomeOptions && (
        <p
          className="alert alert-info"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('security_setting.SAML.note for the only env option', 'SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS') }}
        />
        )}

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.SAML.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isSamlEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isSamlEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsSamlEnabled() }}
              />
              <label htmlFor="isSamlEnabled">
                { t('security_setting.SAML.enable_saml') }
              </label>
            </div>
          </div>
        </div>


      </React.Fragment>
    );

  }

}

SamlSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWrapper = (props) => {
  return createSubscribedElement(SamlSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminSamlSecurityContainer]);
};

export default withTranslation()(SamlSecurityManagementWrapper);
