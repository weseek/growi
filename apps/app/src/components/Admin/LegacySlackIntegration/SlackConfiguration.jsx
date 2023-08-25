import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:slackAppConfiguration');

class SlackConfiguration extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminSlackIntegrationLegacyContainer } = this.props;

    try {
      await adminSlackIntegrationLegacyContainer.updateSlackAppConfiguration();
      toastSuccess(t('notification_settings.updated_slackApp'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminSlackIntegrationLegacyContainer } = this.props;

    return (
      <React.Fragment>
        <div className="row my-3">
          <div className="col-6 text-start">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                {`Slack ${adminSlackIntegrationLegacyContainer.state.selectSlackOption}`}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <button className="dropdown-item" type="button" onClick={() => adminSlackIntegrationLegacyContainer.switchSlackOption('Incoming Webhooks')}>
                  Slack Incoming Webhooks
                </button>
                <button className="dropdown-item" type="button" onClick={() => adminSlackIntegrationLegacyContainer.switchSlackOption('App')}>Slack App</button>
              </div>
            </div>
          </div>
        </div>
        {adminSlackIntegrationLegacyContainer.state.selectSlackOption === 'Incoming Webhooks' ? (
          <React.Fragment>
            <h2 className="border-bottom mb-5">{t('notification_settings.slack_incoming_configuration')}</h2>

            <div className="row mb-3">
              <label className="col-md-3 text-start text-md-right">Webhook URL</label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  defaultValue={adminSlackIntegrationLegacyContainer.state.webhookUrl || ''}
                  onChange={e => adminSlackIntegrationLegacyContainer.changeWebhookUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="offset-md-3 col-md-6 text-start">
                <div className="custom-control custom-checkbox custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="cbPrioritizeIWH"
                    checked={adminSlackIntegrationLegacyContainer.state.isIncomingWebhookPrioritized || false}
                    onChange={() => { adminSlackIntegrationLegacyContainer.switchIsIncomingWebhookPrioritized() }}
                  />
                  <label className="custom-control-label" htmlFor="cbPrioritizeIWH">
                    {t('notification_settings.prioritize_webhook')}
                  </label>
                </div>
                <p className="form-text text-muted">
                  {t('notification_settings.prioritize_webhook_desc')}
                </p>
              </div>
            </div>
          </React.Fragment>
        )
          : (
            <React.Fragment>
              <h2 className="border-bottom mb-5">{t('notification_settings.slack_app_configuration')}</h2>

              <div className="well card">
                <span className="text-danger"><i className="icon-fw icon-exclamation"></i>NOT RECOMMENDED</span>
                <br />
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('notification_settings.slack_app_configuration_desc') }} />
                <br />
                <a
                  href="#slack-incoming-webhooks"
                  data-toggle="tab"
                  onClick={() => adminSlackIntegrationLegacyContainer.switchSlackOption('Incoming Webhooks')}
                >
                  {t('notification_settings.use_instead')}
                </a>
              </div>

              <div className="row mb-5">
                <label className="col-md-3 text-start text-md-right">OAuth access token</label>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    type="text"
                    defaultValue={adminSlackIntegrationLegacyContainer.state.slackToken || ''}
                    onChange={e => adminSlackIntegrationLegacyContainer.changeSlackToken(e.target.value)}
                  />
                </div>
              </div>

            </React.Fragment>
          )
        }

        <AdminUpdateButtonRow
          onClick={this.onClickSubmit}
          disabled={adminSlackIntegrationLegacyContainer.state.retrieveError != null}
        />

        <hr />

        <h3>
          <i className="icon-question" aria-hidden="true"></i>{' '}
          <a href="#collapseHelpForIwh" data-bs-toggle="collapse">{t('notification_settings.how_to.header')}</a>
        </h3>

        <ol id="collapseHelpForIwh" className="collapse">
          <li>
            {t('notification_settings.how_to.workspace')}
            <ol>
              {/* eslint-disable-next-line react/no-danger */}
              <li dangerouslySetInnerHTML={{ __html:  t('notification_settings.how_to.workspace_desc1') }} />
              <li>{t('notification_settings.how_to.workspace_desc2')}</li>
              <li>{t('notification_settings.how_to.workspace_desc3')}</li>
            </ol>
          </li>
          <li>
            {t('notification_settings.how_to.at_growi')}
            <ol>
              {/* eslint-disable-next-line react/no-danger */}
              <li dangerouslySetInnerHTML={{ __html: t('notification_settings.how_to.at_growi_desc') }} />
            </ol>
          </li>
        </ol>

      </React.Fragment>
    );
  }

}


SlackConfiguration.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminSlackIntegrationLegacyContainer: PropTypes.instanceOf(AdminSlackIntegrationLegacyContainer).isRequired,

};

const SlackConfigurationWrapperFc = (props) => {
  const { t } = useTranslation('admin');

  return <SlackConfiguration t={t} {...props} />;
};

const SlackConfigurationWrapper = withUnstatedContainers(SlackConfigurationWrapperFc, [AdminSlackIntegrationLegacyContainer]);

export default SlackConfigurationWrapper;
