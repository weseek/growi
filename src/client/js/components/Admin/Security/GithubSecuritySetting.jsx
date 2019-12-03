/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminGithubSecurityContainer from '../../../services/AdminGithubSecurityConatainer';

const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');

class GithubSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      // await this.props.adminGithubSecurityContainer.updateTwitterSetting();
      toastSuccess(t('security_setting.OAuth.GitHub.updated_github'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminGithubSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.OAuth.GitHub.name') } { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.OAuth.GitHub.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isGithubEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGithubOAuthEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsGithubOAuthEnabled() }}
              />
              <label htmlFor="isGithubEnabled">
                { t('security_setting.OAuth.GitHub.enable_github') }
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
              value={adminGithubSecurityContainer.state.callbackUrl}
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


        {adminGeneralSecurityContainer.state.isGithubOAuthEnabled && (
          <React.Fragment>

            <div className="row mb-5">
              <label htmlFor="githubClientId" className="col-xs-3 text-right">{ t('security_setting.clientID') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientId"
                  value={adminGithubSecurityContainer.state.githubClientId}
                  onChange={e => adminGithubSecurityContainer.changeGithubClientId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_GITHUB_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="githubClientSecret" className="col-xs-3 text-right">{ t('security_setting.client_secret') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientSecret"
                  value={adminGithubSecurityContainer.state.githubClientSecret}
                  onChange={e => adminGithubSecurityContainer.changeGithubClientSecret(e.target.value)}
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
                    id="bindByUserNameGithub"
                    type="checkbox"
                    checked={adminGithubSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminGithubSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameGithub"
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

        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForGithubOauth" data-toggle="collapse"> { t('security_setting.OAuth.how_to.github') }</a>
          </h4>
          <ol id="collapseHelpForGithubOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.GitHub.register_1', { link: '<a href="https://github.com/settings/developers" target=_blank>GitHub Developer Settings</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.GitHub.register_2', { url: adminGithubSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.GitHub.register_3') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


GithubSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGithubSecurityContainer: PropTypes.instanceOf(AdminGithubSecurityContainer).isRequired,
};

const GithubSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GithubSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminGithubSecurityContainer]);
};

export default withTranslation()(GithubSecurityManagementWrapper);
