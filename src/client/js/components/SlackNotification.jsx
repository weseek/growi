import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'reactstrap';
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
    this.state = { isExpanded: false };
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
    const { t } = this.props;

    return (
      <div className="grw-slack-notification">
        <div className="input-group extended-setting">
          <label className="input-group-addon">
            <div className="custom-control custom-switch custom-switch-lg custom-switch-slack">
              <input
                type="checkbox"
                className="custom-control-input border-0"
                id={this.props.id}
                checked={this.props.isSlackEnabled}
                onChange={this.updateCheckboxHandler}
              />
              <label className="custom-control-label" htmlFor={this.props.id}>
              </label>
            </div>
          </label>
          <input
            className="form-control"
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

  setExpanded= (value) => {
    this.setState({ isExpanded: value });
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
          type="button"
          onClick={() => this.setExpanded(!this.state.isExpanded)}
        >
          <i className="icon-arrow-up"></i>
        </button>
        <Collapse isOpen={this.state.isExpanded}>
          <div className="px-2"> {/* set padding for border-top */}
            <div className="navbar navbar-expand border-top px-0">
              <form className="form-inline ml-auto">
                {this.getSlackNormal()}
              </form>
            </div>
          </div>
        </Collapse>
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

  smallScreen: PropTypes.bool.isRequired,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  onEnabledFlagChange: PropTypes.func,
  onChannelChange: PropTypes.func,
  id: PropTypes.string.isRequired,
};

export default withTranslation()(SlackNotification);
