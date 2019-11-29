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

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{ t('security_setting.callback_URL') }</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              value={adminOidcSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="help-block small">{ t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' }) }</p>
            {!adminGeneralSecurityContainer.state.appSiteUrl && (
            <div className="alert alert-danger">
              <i
                className="icon-exclamation"
                // eslint-disable-next-line max-len
                dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App settings')}<i class="icon-login"></i></a>` }) }}
              />
            </div>
            )}
          </div>
        </div>
        {adminGeneralSecurityContainer.state.isOidcEnabled && (
        <React.Fragment>

          <div className="row mb-5">
            <label htmlFor="oidcProviderName" className="col-xs-3 text-right">{ t('security_setting.providerName') }</label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="text"
                name="oidcProviderName"
                value={adminOidcSecurityContainer.state.oidcProviderName}
                onChange={e => adminOidcSecurityContainer.changeOidcProviderName(e.target.value)}
              />
            </div>
          </div>

          <div className="row mb-5">
            <label htmlFor="oidcIssuerHost" className="col-xs-3 text-right">{ t('security_setting.issuerHost') }</label>
            <div className="col-xs-6">
              <input
                className="form-control"
                type="text"
                name="oidcIssuerHost"
                value={adminOidcSecurityContainer.state.oidcIssuerHost}
                onChange={e => adminOidcSecurityContainer.changeOidcIssuerHost(e.target.value)}
              />
              <p className="help-block">
                <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_OIDC_ISSUER_HOST' }) }} />
              </p>
            </div>

          </div>

        </React.Fragment>
        )}
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
