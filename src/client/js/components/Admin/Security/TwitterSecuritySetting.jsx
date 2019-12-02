/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminTwitterSecurityContainer from '../../../services/AdminTwitterSecurityContainer';

const logger = loggerFactory('growi:security:AdminTwitterSecurityContainer');


class TwitterSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      await this.props.adminTwitterSecurityContainer.updateTwitterSetting();
      toastSuccess(t('security_setting.OAuth.Twitter.updated_twitter'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminTwitterSecurityContainer } = this.props;
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          { t('security_setting.OAuth.Twitter.name') } { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">{ t('security_setting.OAuth.Twitter.name') }</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isTwitterEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isTwitterOAuthEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchIsTwitterOAuthEnabled() }}
              />
              <label htmlFor="isTwitterEnabled">
                { t('security_setting.OAuth.Twitter.enable_twitter') }
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
              value={adminTwitterSecurityContainer.state.callbackUrl}
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


        {adminGeneralSecurityContainer.state.isTwitterOAuthEnabled && (
          <React.Fragment>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerId" className="col-xs-3 text-right">{ t('security_setting.clientID') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerId"
                  value={adminTwitterSecurityContainer.state.twitterConsumerKey}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerKey(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_KEY' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="TwitterConsumerSecret" className="col-xs-3 text-right">{ t('security_setting.client_secret') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="TwitterConsumerSecret"
                  value={adminTwitterSecurityContainer.state.twitterConsumerSecret}
                  onChange={e => adminTwitterSecurityContainer.changeTwitterConsumerSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_TWITTER_CONSUMER_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserNameTwitter"
                    type="checkbox"
                    checked={adminTwitterSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser}
                    onChange={() => { adminTwitterSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameTwitter"
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
            <a href="#collapseHelpForTwitterOauth" data-toggle="collapse"> { t('security_setting.OAuth.how_to.twitter') }</a>
          </h4>
          <ol id="collapseHelpForTwitterOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Twitter.register_1', { link: '<a href="https://apps.twitter.com/" target=_blank>Twitter Application Management</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Twitter.register_2') }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Twitter.register_3') }} />
            {/* eslint-disable-next-line max-len */}
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Twitter.register_4', { url: adminTwitterSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html:  t('security_setting.OAuth.Twitter.register_5') }} />
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


TwitterSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminTwitterSecurityContainer: PropTypes.instanceOf(AdminTwitterSecurityContainer).isRequired,
};

const TwitterSecurityManagementWrapper = (props) => {
  return createSubscribedElement(TwitterSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminTwitterSecurityContainer]);
};

export default withTranslation()(TwitterSecurityManagementWrapper);
