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

  getSlackNormal() {
    const { t, slackOnly } = this.props;

    return (
      <div className="grw-slack-notification w-100">
        <div Style="height: 24px" className="input-group extended-setting">
          <label className="input-group-addon">
            <div className="custom-control custom-switch custom-switch-lg custom-switch-slack">
              <input
                type="checkbox"
                className="custom-control-input border-0"
                id={this.props.id}
                checked={this.props.isSlackEnabled}
                onChange={this.updateCheckboxHandler}
              />
              <label className={`custom-control-label align-center ${slackOnly ? 'mt-1' : ''}`} htmlFor={this.props.id}>
              </label>
            </div>
          </label>
          <input
            Style="height: 24px"
            className="form-control align-top"
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


  /*
Note to myself:
The collapse stuff worked, but it should be put in the EditorNavbarBottom level of rendering. The state should be
lifted and button here would only be a trigger for the function at the parrent level. The passed down props would only
affect the rendering of the banner itself.
*/
  getSlackButton() {
    return (
      <div className="grw-slack-notification">
        <button
          // className="grw-slack-notification-button"
          type="button"
          onClick={this.props.click}
        >
          slacks
          <i className="icon-arrow-up"></i>
        </button>
      </div>
    );
  }

  render() {
    return (
      this.props.smallScreen ? this.getSlackButton() : this.getSlackNormal()
    );
  }

}

SlackNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  click: PropTypes.func.isRequired,
  slackOnly: PropTypes.bool.isRequired,

  smallScreen: PropTypes.bool.isRequired,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  onEnabledFlagChange: PropTypes.func,
  onChannelChange: PropTypes.func,
  id: PropTypes.string.isRequired,
};

export default withTranslation()(SlackNotification);
