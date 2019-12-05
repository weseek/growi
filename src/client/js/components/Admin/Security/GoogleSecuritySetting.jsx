/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGoogleSecurityContainer from '../../../services/AdminGoogleSecurityContainer';

const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');

class GoogleSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminGoogleSecurityContainer } = this.props;

    try {
      await adminGoogleSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
      this.setState({ retrieveError: err });
      logger.error(err);
    }
  }

  async onClickSubmit() {
    const { t, adminGoogleSecurityContainer } = this.props;

    try {
      await adminGoogleSecurityContainer.updateGoogleSetting();
      toastSuccess(t('security_setting.OAuth.Twitter.updated_twitter'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminGoogleSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.OAuth.Google.name') } { t('security_setting.configuration') }
        </h2>

        {this.state.retrieveError != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {this.state.err}</p>
        </div>
        )}

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
                  defaultValue={adminGoogleSecurityContainer.state.googleClientId}
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
                  defaultValue={adminGoogleSecurityContainer.state.googleClientSecret}
                  onChange={e => adminGoogleSecurityContainer.changeGoogleClientSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GOOGLE_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserNameGoogle"
                    type="checkbox"
                    checked={adminGoogleSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminGoogleSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameGoogle"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

          </React.Fragment>
        )}

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="button" className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.onClickSubmit}>{ t('Update') }</button>
          </div>
        </div>

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForGoogleOauth" data-toggle="collapse"> { t('security_setting.OAuth.how_to.google') }</a>
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
