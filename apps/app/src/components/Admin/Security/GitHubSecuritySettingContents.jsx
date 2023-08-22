/* eslint-disable react/no-danger */
import React from 'react';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import urljoin from 'url-join';


import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminGitHubSecurityContainer from '~/client/services/AdminGitHubSecurityContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSiteUrl } from '~/stores/context';

import { withUnstatedContainers } from '../../UnstatedUtils';

class GitHubSecurityManagementContents extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminGitHubSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminGitHubSecurityContainer.updateGitHubSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_settings.OAuth.GitHub.updated_github'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const {
      t, adminGeneralSecurityContainer, adminGitHubSecurityContainer, siteUrl,
    } = this.props;
    const { isGitHubEnabled } = adminGeneralSecurityContainer.state;
    const gitHubCallbackUrl = urljoin(pathUtils.removeTrailingSlash(siteUrl), '/passport/github/callback');

    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_settings.OAuth.GitHub.name')}
        </h2>

        {adminGitHubSecurityContainer.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {adminGitHubSecurityContainer.state.retrieveError}</p>
          </div>
        )}

        <div className="form-group row">
          <div className="col-6 offset-3">
            <div className="form-check custom-switch form-check-success">
              <input
                id="isGitHubEnabled"
                className="form-check-input"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isGitHubEnabled || false}
                onChange={() => { adminGeneralSecurityContainer.switchIsGitHubOAuthEnabled() }}
              />
              <label className="form-check-label" htmlFor="isGitHubEnabled">
                {t('security_settings.OAuth.GitHub.enable_github')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('github') && isGitHubEnabled)
              && <div className="badge badge-warning">{t('security_settings.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-12 col-md-3 text-left text-md-right py-2">{t('security_settings.callback_URL')}</label>
          <div className="col-12 col-md-6">
            <input
              className="form-control"
              type="text"
              value={gitHubCallbackUrl}
              readOnly
            />
            <p className="form-text text-muted small">{t('security_settings.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
            {(siteUrl == null || siteUrl === '') && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('alert.siteUrl_is_not_set', { link: `<a href="/admin/app">${t('headers.app_settings', { ns: 'commons' })}<i class="icon-login"></i></a>`, ns: 'commons' }) }}
                />
              </div>
            )}
          </div>
        </div>


        {isGitHubEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_settings.configuration')}</h3>

            <div className="row mb-5">
              <label htmlFor="githubClientId" className="col-3 text-right py-2">{t('security_settings.clientID')}</label>
              <div className="col-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientId"
                  value={adminGitHubSecurityContainer.state.githubClientId || ''}
                  onChange={e => adminGitHubSecurityContainer.changeGitHubClientId(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Use env var if empty', { env: 'OAUTH_GITHUB_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="githubClientSecret" className="col-3 text-right py-2">{t('security_settings.client_secret')}</label>
              <div className="col-6">
                <input
                  className="form-control"
                  type="text"
                  name="githubClientSecret"
                  defaultValue={adminGitHubSecurityContainer.state.githubClientSecret || ''}
                  onChange={e => adminGitHubSecurityContainer.changeGitHubClientSecret(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Use env var if empty', { env: 'OAUTH_GITHUB_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="offset-3 col-6 text-left">
                <div className="form-check form-check-success">
                  <input
                    id="bindByUserNameGitHub"
                    className="form-check-input"
                    type="checkbox"
                    checked={adminGitHubSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                    onChange={() => { adminGitHubSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="bindByUserNameGitHub"
                    dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row my-3">
              <div className="offset-3 col-5">
                <div className="btn btn-primary" disabled={adminGitHubSecurityContainer.state.retrieveError != null} onClick={this.onClickSubmit}>
                  {t('Update')}
                </div>
              </div>
            </div>

          </React.Fragment>
        )}

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForGitHubOauth" data-toggle="collapse"> {t('security_settings.OAuth.how_to.github')}</a>
          </h4>
          <ol id="collapseHelpForGitHubOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.GitHub.register_1', { link: '<a href="https://github.com/settings/developers" target=_blank>GitHub Developer Settings</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.GitHub.register_2', { url: gitHubCallbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.GitHub.register_3') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}

const GitHubSecurityManagementContentsFC = (props) => {
  const { t } = useTranslation('admin');
  const { data: siteUrl } = useSiteUrl();
  return <GitHubSecurityManagementContents t={t} siteUrl={siteUrl} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const GitHubSecurityManagementContentsWrapper = withUnstatedContainers(GitHubSecurityManagementContentsFC, [
  AdminGeneralSecurityContainer,
  AdminGitHubSecurityContainer,
]);

GitHubSecurityManagementContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminGitHubSecurityContainer: PropTypes.instanceOf(AdminGitHubSecurityContainer).isRequired,
};

export default GitHubSecurityManagementContentsWrapper;
