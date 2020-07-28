import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
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
        <div className="row my-3">
          <div className="col-6 text-left">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                {`Slack ${adminNotificationContainer.state.selectSlackOption}`}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <button className="dropdown-item" type="button" onClick={() => adminNotificationContainer.switchSlackOption('Incoming Webhooks')}>
                  Slack Incoming Webhooks
                </button>
                <button className="dropdown-item" type="button" onClick={() => adminNotificationContainer.switchSlackOption('App')}>Slack App</button>
              </div>
            </div>
          </div>
        </div>
        {adminNotificationContainer.state.selectSlackOption === 'Incoming Webhooks' ? (
          <React.Fragment>
            <h2 className="border-bottom mb-5">{t('notification_setting.slack_incoming_configuration')}</h2>

            <div className="row mb-3">
              <label className="col-md-3 text-left text-md-right">Webhook URL</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  value={adminNotificationContainer.state.webhookUrl || ''}
                  onChange={e => adminNotificationContainer.changeWebhookUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="cbPrioritizeIWH"
                    checked={adminNotificationContainer.state.isIncomingWebhookPrioritized || false}
                    onChange={() => { adminNotificationContainer.switchIsIncomingWebhookPrioritized() }}
                  />
                  <label className="custom-control-label" htmlFor="cbPrioritizeIWH">
                    {t('notification_setting.prioritize_webhook')}
                  </label>
                </div>
                <p className="form-text text-muted">
                  {t('notification_setting.prioritize_webhook_desc')}
                </p>
              </div>
            </div>
          </React.Fragment>
        )
          : (
            <React.Fragment>
              <h2 className="border-bottom mb-5">{t('notification_setting.slack_app_configuration')}</h2>

              <div className="well card">
                <span className="text-danger"><i className="icon-fw icon-exclamation"></i>NOT RECOMMENDED</span>
                <br />
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('notification_setting.slack_app_configuration_desc') }} />
                <br />
                <a
                  href="#slack-incoming-webhooks"
                  data-toggle="tab"
                  onClick={() => adminNotificationContainer.switchSlackOption('Incoming Webhooks')}
                >
                  {t('notification_setting.use_instead')}
                </a>
              </div>

              <div className="row mb-5">
                <label className="col-md-3 text-left text-md-right">OAuth access token</label>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    type="text"
                    value={adminNotificationContainer.state.slackToken || ''}
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

const SlackAppConfigurationWrapper = withUnstatedContainers(SlackAppConfiguration, [AppContainer, AdminNotificationContainer]);

SlackAppConfiguration.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(SlackAppConfigurationWrapper);
