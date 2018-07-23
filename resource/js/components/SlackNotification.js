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

  updateState(value) {
    this.setState({slackChannels: value});
    this.props.onChannelChange(value);
  }

  updateStateCheckbox(event) {
    const value = event.target.checked;
    this.setState({isSlackEnabled: value});
    this.props.onSlackOnChange(value);
  }

  render() {
    const formNameSlackOn = this.props.formName && this.props.formName + '[notify][slack][on]';
    const formNameChannels = this.props.formName && this.props.formName + '[notify][slack][channel]';

    return (
      <div className="input-group input-group-sm input-group-slack extended-setting">
        <label className="input-group-addon">
          <img id="slack-mark-white" src="/images/icons/slack/mark-monochrome_white.svg" width="18" height="18"/>
          <img id="slack-mark-black" src="/images/icons/slack/mark-monochrome_black.svg" width="18" height="18"/>
          <input type="checkbox" name={formNameSlackOn} value="1" checked={this.state.isSlackEnabled} onChange={this.updateStateCheckbox}/>
        </label>
        <input className="form-control" type="text" name={formNameChannels} value={this.state.slackChannels} placeholder="slack channel name"
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
  onChannelChange: PropTypes.func,
  onSlackOnChange: PropTypes.func,
  isSlackEnabled: PropTypes.bool,
  slackChannels: PropTypes.string,
  formName: PropTypes.string,
};

SlackNotification.defaultProps = {
  slackChannels: '',
};
