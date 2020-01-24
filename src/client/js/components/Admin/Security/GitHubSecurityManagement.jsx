/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '../../../services/AdminGitHubSecurityContainer';

const logger = loggerFactory('growi:security:AdminGitHubSecurityContainer');

class GitHubSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminGitHubSecurityContainer } = this.props;

    try {
      await adminGitHubSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
      this.setState({ retrieveError: err.message });
      logger.error(err);
    }
  }

  async onClickSubmit() {
    const { t, adminGitHubSecurityContainer } = this.props;

    try {
      await adminGitHubSecurityContainer.updateGitHubSetting();
      toastSuccess(t('security_setting.OAuth.GitHub.updated_github'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminGitHubSecurityContainer } = this.props;
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
                id="isGitHubEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGitHubEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsGitHubOAuthEnabled() }}
              />
              <label htmlFor="isGitHubEnabled">
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
              value={adminGitHubSecurityContainer.state.appSiteUrl}
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
                  value={adminGitHubSecurityContainer.state.githubClientId}
                  onChange={e => adminGitHubSecurityContainer.changeGitHubClientId(e.target.value)}
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
                  defaultValue={adminGitHubSecurityContainer.state.githubClientSecret}
                  onChange={e => adminGitHubSecurityContainer.changeGitHubClientSecret(e.target.value)}
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
                    id="bindByUserNameGitHub"
                    type="checkbox"
                    checked={adminGitHubSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminGitHubSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameGitHub"
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
            <a href="#collapseHelpForGitHubOauth" data-toggle="collapse"> {t('security_setting.OAuth.how_to.github')}</a>
          </h4>
          <ol id="collapseHelpForGitHubOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_1', { link: '<a href="https://github.com/settings/developers" target=_blank>GitHub Developer Settings</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_2', { url: adminGitHubSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.GitHub.register_3') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


GitHubSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGitHubSecurityContainer: PropTypes.instanceOf(AdminGitHubSecurityContainer).isRequired,
};

const GitHubSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GitHubSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminGitHubSecurityContainer]);
};

export default withTranslation()(GitHubSecurityManagementWrapper);
