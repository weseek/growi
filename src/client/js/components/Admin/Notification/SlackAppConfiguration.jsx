import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

class SlackAppConfiguration extends React.Component {

  // TODO GW-788 i18n
  render() {
    const { adminNotificationContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="border-bottom mb-5">Slack Incoming Webhooks Configuration</h2>

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
                Prioritize Incoming Webhook than Slack App
              </label>
            </div>
            <p className="help-block">
              Check this option and GROWI use Incoming Webhooks even if Slack App settings are enabled.
            </p>
          </div>
        </div>

        <AdminUpdateButtonRow />

        <hr />

        <h3>
          <i className="icon-question" aria-hidden="true"></i>
          <a href="#collapseHelpForIwh" data-toggle="collapse">How to configure Incoming Webhooks?</a>
        </h3>

        <ol id="collapseHelpForIwh" className="collapse">
          <li>
            (At Workspace) Add a hook
            <ol>
              <li>Go to <a href="https://slack.com/services/new/incoming-webhook">Incoming Webhooks Configuration page</a>.</li>
              <li>Choose the default channel to post.</li>
              <li>Add.</li>
            </ol>
          </li>
          <li>
            (At GROWI admin page) Set Webhook URL
            <ol>
              <li>Input &rdquo;Webhook URL&rdquo; and submit on this page.</li>
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
