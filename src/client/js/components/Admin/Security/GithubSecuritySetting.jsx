/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGutHubSecurityContainer from '../../../services/AdminGitHubSecurityConatainer';

const logger = loggerFactory('growi:security:AdminGitHubSecurityContainer');

class GutHubSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminGutHubSecurityContainer } = this.props;

    try {
      await adminGutHubSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
      this.setState({ retrieveError: err.message });
      logger.error(err);
    }
  }

  async onClickSubmit() {
    const { t, adminGutHubSecurityContainer } = this.props;

    try {
      await adminGutHubSecurityContainer.updateGitHubSetting();
      toastSuccess(t('security_setting.OAuth.GitHub.updated_github'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminGutHubSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.OAuth.GitHub.name')} {t('security_setting.configuration')}
        </h2>

        {this.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {this.state.err}</p>
          </div>
        )}

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{t('security_setting.OAuth.GitHub.name')}</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isGutHubEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGitHubEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsGutHubOAuthEnabled() }}
              />
              <label htmlFor="isGutHubEnabled">
                {t('security_setting.OAuth.GitHub.enable_github')}
              </label>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{t('security_setting.callback_URL')}</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              value={adminGutHubSecurityContainer.state.appSiteUrl}
              readOnly
            />
            <p className="help-block small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
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


        {adminGeneralSecurityContainer.state.isGitHubEnabled && (
          <React.Fragment>

            <div className="row mb-5">
              <label htmlFor="githubClientId" className="col-xs-3 text-right">{t('security_setting.clientID')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientId"
                  value={adminGutHubSecurityContainer.state.githubClientId}
                  onChange={e => adminGutHubSecurityContainer.changeGutHubClientId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GITHUB_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="githubClientSecret" className="col-xs-3 text-right">{t('security_setting.client_secret')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientSecret"
                  defaultValue={adminGutHubSecurityContainer.state.githubClientSecret}
                  onChange={e => adminGutHubSecurityContainer.changeGutHubClientSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GITHUB_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserNameGutHub"
                    type="checkbox"
                    checked={adminGutHubSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminGutHubSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameGutHub"
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
          <div className="col-xs-offset-3 col-xs-5">
            <div className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.onClickSubmit}>{t('Update')}</div>
          </div>
        </div>

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForGutHubOauth" data-toggle="collapse"> {t('security_setting.OAuth.how_to.github')}</a>
          </h4>
          <ol id="collapseHelpForGutHubOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_1', { link: '<a href="https://github.com/settings/developers" target=_blank>GitHub Developer Settings</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_2', { url: adminGutHubSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_3') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


GutHubSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGutHubSecurityContainer: PropTypes.instanceOf(AdminGutHubSecurityContainer).isRequired,
};

const GutHubSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GutHubSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminGutHubSecurityContainer]);
};

export default withTranslation()(GutHubSecurityManagementWrapper);
