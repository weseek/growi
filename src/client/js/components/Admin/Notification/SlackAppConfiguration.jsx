import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:slackAppConfiguration');

class SlackAppConfiguration extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminNotificationContainer } = this.props;

    try {
      await adminNotificationContainer.updateSlackAppConfiguration();
      toastSuccess(t('notification_setting.updated_slackApp'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminNotificationContainer } = this.props;

    return (
      <React.Fragment>
        <div className="row mb-5">
          <div className="col-xs-6 text-left">
            <div className="my-0 btn-group">
              <div className="dropdown">
                <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="pull-left">Slack {adminNotificationContainer.state.selectSlackOption} </span>
                  <span className="bs-caret pull-right">
                    <span className="caret" />
                  </span>
                </button>
                {/* TODO adjust dropdown after BS4 */}
                <ul className="dropdown-menu" role="menu">
                  <li type="button" onClick={() => adminNotificationContainer.switchSlackOption('Incoming Webhooks')}>
                    <a role="menuitem">Slack Incoming Webhooks</a>
                  </li>
                  <li type="button" onClick={() => adminNotificationContainer.switchSlackOption('App')}>
                    <a role="menuitem">Slack App</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {adminNotificationContainer.state.selectSlackOption === 'Incoming Webhooks' ? (
          <React.Fragment>
            <h2 className="border-bottom mb-5">{t('notification_setting.slack_incoming_configuration')}</h2>

            <div className="row mb-5">
              <label className="col-xs-3 text-right">Webhook URL</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  defaultValue={adminNotificationContainer.state.webhookUrl}
                  onChange={e => adminNotificationContainer.changeWebhookUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="cbPrioritizeIWH"
                    type="checkbox"
                    checked={adminNotificationContainer.state.isIncomingWebhookPrioritized}
                    onChange={() => { adminNotificationContainer.switchIsIncomingWebhookPrioritized() }}
                  />
                  <label htmlFor="cbPrioritizeIWH">
                    {t('notification_setting.prioritize_webhook')}
                  </label>
                </div>
                <p className="help-block">
                  {t('notification_setting.prioritize_webhook_desc')}
                </p>
              </div>
            </div>
          </React.Fragment>
        )
          : (
            <React.Fragment>
              <h2 className="border-bottom mb-5">{t('notification_setting.slack_app_configuration')}</h2>

              <div className="well">
                <i className="icon-fw icon-exclamation text-danger"></i><span className="text-danger">NOT RECOMMENDED</span>
                <br /><br />
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('notification_setting.slack_app_configuration_desc') }} />
                <br /><br />
                <a
                  href="#slack-incoming-webhooks"
                  data-toggle="tab"
                  onClick={() => adminNotificationContainer.switchSlackOption('Incoming Webhooks')}
                >
                  {t('notification_setting.use_instead')}
                </a>{' '}
              </div>

              <div className="row mb-5">
                <label className="col-xs-3 text-right">OAuth Access Token</label>
                <div className="col-xs-6">
                  <input
                    className="form-control"
                    type="text"
                    defaultValue={adminNotificationContainer.state.slackToken}
                    onChange={e => adminNotificationContainer.changeSlackToken(e.target.value)}
                  />
                </div>
              </div>

            </React.Fragment>
          )
        }

        <AdminUpdateButtonRow
          onClick={this.onClickSubmit}
          disabled={adminNotificationContainer.state.retrieveError != null}
        />

        <hr />

        <h3>
          <i className="icon-question" aria-hidden="true"></i>{' '}
          <a href="#collapseHelpForIwh" data-toggle="collapse">{t('notification_setting.how_to.header')}</a>
        </h3>

        <ol id="collapseHelpForIwh" className="collapse">
          <li>
            {t('notification_setting.how_to.workspace')}
            <ol>
              {/* eslint-disable-next-line react/no-danger */}
              <li dangerouslySetInnerHTML={{ __html:  t('notification_setting.how_to.workspace_desc1') }} />
              <li>{t('notification_setting.how_to.workspace_desc2')}</li>
              <li>{t('notification_setting.how_to.workspace_desc3')}</li>
            </ol>
          </li>
          <li>
            {t('notification_setting.how_to.at_growi')}
            <ol>
              {/* eslint-disable-next-line react/no-danger */}
              <li dangerouslySetInnerHTML={{ __html: t('notification_setting.how_to.at_growi_desc') }} />
            </ol>
          </li>
        </ol>

      </React.Fragment>
    );
  }

}

const SlackAppConfigurationWrapper = (props) => {
  return createSubscribedElement(SlackAppConfiguration, props, [AppContainer, AdminNotificationContainer]);
};

SlackAppConfiguration.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(SlackAppConfigurationWrapper);
