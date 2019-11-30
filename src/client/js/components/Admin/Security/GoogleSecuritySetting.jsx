/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGoogleSecurityContainer from '../../../services/AdminGoogleSecurityContainer';

class GoogleSecurityManagement extends React.Component {

  render() {
    const { t, adminGeneralSecurityContainer, adminGoogleSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.OAuth.Google.name') } { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.OAuth.Google.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isGoogleEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGoogleOAuthEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsGoogleOAuthEnabled() }}
              />
              <label htmlFor="isGoogleEnabled">
                { t('security_setting.OAuth.Google.enable_google') }
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
              value={adminGoogleSecurityContainer.state.callbackUrl}
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


        {adminGeneralSecurityContainer.state.isGoogleOAuthEnabled && (
          <React.Fragment>

            <div className="row mb-5">
              <label htmlFor="googleClientId" className="col-xs-3 text-right">{ t('security_setting.clientID') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="googleClientId"
                  value={adminGoogleSecurityContainer.state.googleClientId}
                  onChange={e => adminGoogleSecurityContainer.changeGoogleClientId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GOOGLE_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="googleClientSecret" className="col-xs-3 text-right">{ t('security_setting.client_secret') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="googleClientSecret"
                  value={adminGoogleSecurityContainer.state.googleClientSecret}
                  onChange={e => adminGoogleSecurityContainer.changeGoogleClientSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GOOGLE_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

          </React.Fragment>
        )}

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForGoogleOauth" data-toggle="collapse">{ t('security_setting.OAuth.how_to.google') }</a>
          </h4>
          <ol id="collapseHelpForGoogleOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Google.register_1', { link: '<a href="https://console.cloud.google.com/apis/credentials" target=_blank>Google Cloud Platform API Manager</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Google.register_2') }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Google.register_3') }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Google.register_4', { url: adminGoogleSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Google.register_5') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


GoogleSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGoogleSecurityContainer: PropTypes.instanceOf(AdminGoogleSecurityContainer).isRequired,
};

const GoogleSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GoogleSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminGoogleSecurityContainer]);
};

export default withTranslation()(GoogleSecurityManagementWrapper);
