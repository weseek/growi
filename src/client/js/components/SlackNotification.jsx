import React from 'react';
import PropTypes from 'prop-types';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class SlackNotification
 * @extends {React.Component}
 */

export default class SlackNotification extends React.Component {

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
    return (
      <div className="input-group input-group-sm input-group-slack extended-setting">
        <label className="input-group-addon">
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
          title="Slack通知"
          data-content="通知するにはチェックを入れてください。カンマ区切りで複数チャンネルに通知することができます。"
          data-trigger="focus"
          data-placement="top"
          onChange={this.updateSlackChannelsHandler}
        />
      </div>
    );
  }

}

SlackNotification.propTypes = {
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  onEnabledFlagChange: PropTypes.func,
  onChannelChange: PropTypes.func,
};
