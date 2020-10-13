import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class SlackNotification
 * @extends {React.Component}
 */

class SlackNotification extends React.Component {

  constructor(props) {
    super(props);

    this.updateCheckboxHandler = this.updateCheckboxHandler.bind(this);
    this.updateSlackChannelsHandler = this.updateSlackChannelsHandler.bind(this);
  }

  updateCheckboxHandler(event) {
    const value = event.target.checked;
    if (this.props.onEnabledFlagChange != null) {
      this.props.onEnabledFlagChange(value);
    }
  }

  updateSlackChannelsHandler(event) {
    const value = event.target.value;
    if (this.props.onChannelChange != null) {
      this.props.onChannelChange(value);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className="grw-slack-notification w-100">
        <div className="grw-input-group-slack-notification input-group extended-setting">
          <label className="input-group-addon">
            <div className="custom-control custom-switch custom-switch-lg custom-switch-slack">
              <input
                type="checkbox"
                className="custom-control-input border-0"
                id={this.props.id}
                checked={this.props.isSlackEnabled}
                onChange={this.updateCheckboxHandler}
              />
              <label className="custom-control-label align-center" htmlFor={this.props.id}>
              </label>
            </div>
          </label>
          <input
            className="grw-form-control-slack-notification form-control align-top pl-0"
            type="text"
            value={this.props.slackChannels}
            placeholder="Input channels"
            data-toggle="popover"
            title={t('slack_notification.popover_title')}
            data-content={t('slack_notification.popover_desc')}
            data-trigger="focus"
            data-placement="top"
            onChange={this.updateSlackChannelsHandler}
          />
        </div>
      </div>
    );
  }

}

SlackNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  popUp: PropTypes.bool.isRequired,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  onEnabledFlagChange: PropTypes.func,
  onChannelChange: PropTypes.func,
  id: PropTypes.string.isRequired,
};

export default withTranslation()(SlackNotification);
