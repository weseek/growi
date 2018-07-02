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
      isNotification: false,
      notifSlackChannel: '',
    };

    this.init = this.init.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);
  }

  componentWillMount() {
    const pageId = this.props.pageId;

    if (pageId) {
      this.init();
    }

    this.retrieveData = this.retrieveData.bind(this);
  }

  init() {
    if (!this.props.pageId) {
      return ;
    }
    this.retrieveData();
  }

  /**
   * Load data of comments and store them in state
   */
  retrieveData() {
    // get data (desc order array)
    this.props.crowi.apiGet('/pages.updatePost', {path: this.props.pagePath})
    .then(res => {
      if (res.ok) {
        this.setState({notifSlackChannel: res.updatePost.join(',')});
      }
    });
  }

  updateState(value) {
    this.setState({notifSlackChannel: value})
  }

  updateStateCheckbox(event) {
    const value = event.target.checked;
    this.setState({isNotification: value})
  }

  render() {
    return (
      <div className="form-inline d-flex align-items-center" id="comment-form-setting">
        <span className="input-group input-group-sm input-group-slack extended-setting m-r-5">
          <label className="input-group-addon">
            <img id="slack-mark-white" src="/images/icons/slack/mark-monochrome_white.svg" width="18" height="18"/>
            <img id="slack-mark-black" src="/images/icons/slack/mark-monochrome_black.svg" width="18" height="18"/>
            <input className="comment-form-slack" type="checkbox" name="slack" value="1" onChange={this.updateStateCheckbox}/>
          </label>
          <input className="form-control" type="text" value={this.state.notifSlackChannel} placeholder="slack-channel-name"
            id="comment-form-slack-channel"
            data-toggle="popover"
            title="Slack通知"
            data-content="通知するにはチェックを入れてください。カンマ区切りで複数チャンネルに通知することができます。"
            data-trigger="focus"
            data-placement="top"
            onChange={e => this.updateState(e.target.value)}
            />
        </span>
      </div>
    );
  }
}



SlackNotification.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  pagePath: PropTypes.string,
};
