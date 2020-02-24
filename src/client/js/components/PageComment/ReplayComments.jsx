import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import Collapse from 'react-bootstrap/es/Collapse';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import Comment from './Comment';

import { createSubscribedElement } from '../UnstatedUtils';

class ReplayComments extends React.PureComponent {

  constructor() {
    super();

    this.state = {
      isOlderRepliesShown: false,
    };

    this.toggleIsOlderRepliesShown = this.toggleIsOlderRepliesShown.bind(this);
  }

  toggleIsOlderRepliesShown() {
    this.setState({ isOlderRepliesShown: !this.state.isOlderRepliesShown });
  }

  renderReply(reply) {
    return (
      <div key={reply._id} className="page-comment-reply">
        <Comment
          comment={reply}
          deleteBtnClicked={this.props.deleteBtnClicked}
          growiRenderer={this.props.growiRenderer}
        />
      </div>
    );
  }

  render() {

    const layoutType = this.props.appContainer.getConfig().layoutType;
    const isBaloonStyle = layoutType.match(/crowi-plus|growi|kibela/);

    const isAllReplyShown = this.props.appContainer.getConfig().isAllReplyShown || false;

    let replyList = this.props.replyList;
    if (!isBaloonStyle) {
      replyList = replyList.slice().reverse();
    }

    if (isAllReplyShown) {
      return (
        <React.Fragment>
          {replyList.map((reply) => {
            return this.renderReply(reply);
          })}
        </React.Fragment>
      );
    }

    const areThereHiddenReplies = (replyList.length > 2);

    const { isOlderRepliesShown } = this.state;
    const toggleButtonIconName = isOlderRepliesShown ? 'icon-arrow-up' : 'icon-options-vertical';
    const toggleButtonIcon = <i className={`icon-fw ${toggleButtonIconName}`}></i>;
    const toggleButtonLabel = isOlderRepliesShown ? '' : 'more';

    const shownReplies = replyList.slice(replyList.length - 2, replyList.length);
    const hiddenReplies = replyList.slice(0, replyList.length - 2);

    const hiddenElements = hiddenReplies.map((reply) => {
      return this.renderReply(reply);
    });

    const shownElements = shownReplies.map((reply) => {
      return this.renderReply(reply);
    });

    return (
      <React.Fragment>
        {areThereHiddenReplies && (
          <div className="page-comments-hidden-replies">
            <Collapse in={this.state.isOlderRepliesShown}>
              <div>{hiddenElements}</div>
            </Collapse>
            <div className="text-center">
              <Button
                bsStyle="link"
                className="page-comments-list-toggle-older"
                onClick={this.toggleIsOlderRepliesShown}
              >
                {toggleButtonIcon} {toggleButtonLabel}
              </Button>
            </div>
          </div>
        )}
        {shownElements}

      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ReplayCommentsWrapper = (props) => {
  return createSubscribedElement(ReplayComments, props, [AppContainer, PageContainer]);
};

ReplayComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  growiRenderer: PropTypes.object.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  replyList: PropTypes.array,
};

export default ReplayCommentsWrapper;
