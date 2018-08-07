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

    this.state = {
      isSlackEnabled: this.props.isSlackEnabled,
      slackChannels: this.props.slackChannels,
    };

    this.updateState = this.updateState.bind(this);
    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isSlackEnabled: nextProps.isSlackEnabled,
      slackChannels: nextProps.slackChannels
    });
  }

  getCurrentOptionsToSave() {
    return Object.assign({}, this.state);
  }

  updateState(value) {
    this.setState({slackChannels: value});
    // dispatch event
    if (this.props.onChannelChange != null) {
      this.props.onChannelChange(value);
    }
  }

  updateStateCheckbox(event) {
    const value = event.target.checked;
    this.setState({isSlackEnabled: value});
    // dispatch event
    if (this.props.onEnabledFlagChange != null) {
      this.props.onEnabledFlagChange(value);
    }
  }

  render() {
    return (
      <div className="input-group input-group-sm input-group-slack extended-setting">
        <label className="input-group-addon">
          <img id="slack-mark-white" src="/images/icons/slack/mark-monochrome_white.svg" width="18" height="18"/>
          <img id="slack-mark-black" src="/images/icons/slack/mark-monochrome_black.svg" width="18" height="18"/>
          <input type="checkbox" value="1" checked={this.state.isSlackEnabled} onChange={this.updateStateCheckbox}/>
        </label>
        <input className="form-control" type="text" value={this.state.slackChannels} placeholder="slack channel name"
          data-toggle="popover"
          title="Slack通知"
          data-content="通知するにはチェックを入れてください。カンマ区切りで複数チャンネルに通知することができます。"
          data-trigger="focus"
          data-placement="top"
          onChange={e => this.updateState(e.target.value)}
          />
      </div>
    );
  }
}

SlackNotification.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  pagePath: PropTypes.string,
  isSlackEnabled: PropTypes.bool,
  slackChannels: PropTypes.string,
  onChannelChange: PropTypes.func,
  onEnabledFlagChange: PropTypes.func,
};

SlackNotification.defaultProps = {
  slackChannels: '',
};
