/* eslint-disable react/no-danger */
import React from 'react';

import { pathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import urljoin from 'url-join';


import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import AdminTwitterSecurityContainer from '~/client/services/AdminTwitterSecurityContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { useSiteUrl } from '~/stores/context';

import { withUnstatedContainers } from '../../UnstatedUtils';

class TwitterSecuritySettingContents extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminTwitterSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminTwitterSecurityContainer.updateTwitterSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_settings.OAuth.Twitter.updated_twitter'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const {
      t, adminGeneralSecurityContainer, adminTwitterSecurityContainer, siteUrl,
    } = this.props;
    const { isTwitterEnabled } = adminGeneralSecurityContainer.state;
    const twitterCallbackUrl = urljoin(pathUtils.removeTrailingSlash(siteUrl), '/passport/twitter/callback');

    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_settings.OAuth.Twitter.name')}
        </h2>

        {adminTwitterSecurityContainer.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {adminTwitterSecurityContainer.state.retrieveError}</p>
          </div>
        )}

        <div className="form-group row">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                id="isTwitterEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isTwitterEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsTwitterOAuthEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isTwitterEnabled">
                {t('security_settings.OAuth.Twitter.enable_twitter')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('twitter') && isTwitterEnabled)
              && <div className="badge badge-warning">{t('security_settings.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-md-3 text-md-right py-2">{t('security_settings.callback_URL')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              value={twitterCallbackUrl}
              readOnly
            />
            <p className="form-text text-muted small">{t('security_settings.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
            {(siteUrl == null || siteUrl === '') && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('commons:alert.siteUrl_is_not_set', { link: `<a href="/admin/app">${t('commons:headers.app_settings')}<i class="icon-login"></i></a>` }) }}
                />
              </div>
            )}
          </div>
        </div>


        {isTwitterEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_settings.configuration')}</h3>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerId" className="col-md-3 text-md-right py-2">{t('security_settings.clientID')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerId"
                  defaultValue={adminTwitterSecurityContainer.state.twitterConsumerKey || ''}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerKey(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_KEY' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerSecret" className="col-md-3 text-md-right py-2">{t('security_settings.client_secret')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerSecret"
                  defaultValue={adminTwitterSecurityContainer.state.twitterConsumerSecret || ''}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerSecret(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="offset-md-3 col-md-6">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    id="bindByUserNameTwitter"
                    className="custom-control-input"
                    type="checkbox"
                    checked={adminTwitterSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                    onChange={() => { adminTwitterSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="bindByUserNameTwitter"
                    dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_settings.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row my-3">
              <div className="offset-4 col-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminTwitterSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
                  {t('Update')}
                </button>
              </div>
            </div>

          </React.Fragment>
        )}

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForTwitterOauth" data-toggle="collapse"> {t('security_settings.OAuth.how_to.twitter')}</a>
          </h4>
          <ol id="collapseHelpForTwitterOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.Twitter.register_1', { link: '<a href="https://apps.twitter.com/" target=_blank>Twitter Application Management</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.Twitter.register_2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.Twitter.register_3') }} />
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.Twitter.register_4', { url: adminTwitterSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_settings.OAuth.Twitter.register_5') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}

TwitterSecuritySettingContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
  siteUrl: PropTypes.string,
};

const TwitterSecuritySettingContentsWrapperFC = (props) => {
  const { t } = useTranslation('admin');
  const { data: siteUrl } = useSiteUrl();
  return <TwitterSecuritySettingContents t={t} siteUrl={siteUrl} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const TwitterSecuritySettingContentsWrapper = withUnstatedContainers(TwitterSecuritySettingContentsWrapperFC, [
  AdminGeneralSecurityContainer,
  AdminTwitterSecurityContainer,
]);

export default TwitterSecuritySettingContentsWrapper;
