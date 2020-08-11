/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminTwitterSecurityContainer from '../../../services/AdminTwitterSecurityContainer';

class TwitterSecurityManagementContents extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminTwitterSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminTwitterSecurityContainer.updateTwitterSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.OAuth.Twitter.updated_twitter'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminTwitterSecurityContainer } = this.props;
    const { isTwitterEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.OAuth.Twitter.name')}
        </h2>

        {this.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {this.state.err}</p>
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
                {t('security_setting.OAuth.Twitter.enable_twitter')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('twitter') && isTwitterEnabled)
              && <div className="badge badge-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-md-3 text-md-right py-2">{t('security_setting.callback_URL')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              value={adminTwitterSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="form-text text-muted small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
            {!adminGeneralSecurityContainer.state.appSiteUrl && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App Settings')}<i class="icon-login"></i></a>` }) }}
                />
              </div>
            )}
          </div>
        </div>


        {isTwitterEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_setting.configuration')}</h3>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerId" className="col-md-3 text-md-right py-2">{t('security_setting.clientID')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerId"
                  defaultValue={adminTwitterSecurityContainer.state.twitterConsumerKey || ''}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerKey(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_KEY' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerSecret" className="col-md-3 text-md-right py-2">{t('security_setting.client_secret')}</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerSecret"
                  defaultValue={adminTwitterSecurityContainer.state.twitterConsumerSecret || ''}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerSecret(e.target.value)}
                />
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_SECRET' }) }} />
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
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="form-text text-muted">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
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
            <a href="#collapseHelpForTwitterOauth" data-toggle="collapse"> {t('security_setting.OAuth.how_to.twitter')}</a>
          </h4>
          <ol id="collapseHelpForTwitterOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Twitter.register_1', { link: '<a href="https://apps.twitter.com/" target=_blank>Twitter Application Management</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Twitter.register_2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Twitter.register_3') }} />
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Twitter.register_4', { url: adminTwitterSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Twitter.register_5') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


TwitterSecurityManagementContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementContentsWrapper = withUnstatedContainers(TwitterSecurityManagementContents, [
  AdminGeneralSecurityContainer,
  AdminTwitterSecurityContainer,
]);

export default withTranslation()(TwitterSecurityManagementContentsWrapper);
