import React from 'react';

import { Subscribe } from 'unstated';

import PageContainer from '../services/PageContainer';

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

    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);
  }

  updateStateCheckbox(event, pageContainer) {
    const value = event.target.checked;
    pageContainer.setState({ isSlackEnabled: value });
  }

  updateStateChannels(slackChannels, pageContainer) {
    pageContainer.setState({ slackChannels });
  }

  render() {
    return (
      <Subscribe to={[PageContainer]}>
        { pageContainer => (
          // eslint-disable-next-line arrow-body-style
          <div className="input-group input-group-sm input-group-slack extended-setting">
            <label className="input-group-addon">
              <img id="slack-mark-white" alt="slack-mark" src="/images/icons/slack/mark-monochrome_white.svg" width="18" height="18" />
              <img id="slack-mark-black" alt="slack-mark" src="/images/icons/slack/mark-monochrome_black.svg" width="18" height="18" />

              <input
                type="checkbox"
                value="1"
                checked={pageContainer.state.isSlackEnabled}
                onChange={(e) => { this.updateStateCheckbox(e, pageContainer) }}
              />

            </label>
            <input
              className="form-control"
              type="text"
              value={pageContainer.state.slackChannels}
              placeholder="slack channel name"
              data-toggle="popover"
              title="Slack通知"
              data-content="通知するにはチェックを入れてください。カンマ区切りで複数チャンネルに通知することができます。"
              data-trigger="focus"
              data-placement="top"
              onChange={(e) => { this.updateStateChannels(e.target.value, pageContainer) }}
            />
          </div>
        )}
      </Subscribe>
    );
  }

}

SlackNotification.propTypes = {
};
