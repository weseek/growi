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
      <div className="input-group input-group-sm input-group-slack extended-setting">
        <label className="input-group-addon bg-light">
          <img id="slack-mark-white" alt="slack-mark" src="/images/icons/slack/mark-monochrome_white.svg" width="18" height="18" />
          <img id="slack-mark-black" alt="slack-mark" src="/images/icons/slack/mark-monochrome_black.svg" width="18" height="18" />

          <input
            type="checkbox"
            value="1"
            checked={this.props.isSlackEnabled}
            onChange={this.updateCheckboxHandler}
          />

        </label>
        <input
          className="form-control"
          type="text"
          value={this.props.slackChannels}
          placeholder="slack channel name"
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

  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  onEnabledFlagChange: PropTypes.func,
  onChannelChange: PropTypes.func,
};

export default withTranslation()(SlackNotification);
