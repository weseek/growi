/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminOidcSecurityContainer from '../../../services/AdminOidcSecurityContainer';


class OidcSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer, adminOidcSecurityContainer } = this.props;

    return (

      <React.Fragment>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.OAuth.OIDC.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isOidcEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isOidcEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsOidcEnabled() }}
              />
              <label htmlFor="isOidcEnabled">
                { t('security_setting.OAuth.enable_oidc') }
              </label>
            </div>
          </div>
        </div>

        <p>{adminOidcSecurityContainer.state.hoge}</p>

      </React.Fragment>
    );
  }

}

OidcSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminOidcSecurityContainer: PropTypes.instanceOf(AdminOidcSecurityContainer).isRequired,
};

const OidcSecurityManagementWrapper = (props) => {
  return createSubscribedElement(OidcSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminOidcSecurityContainer]);
};

export default withTranslation()(OidcSecurityManagementWrapper);
