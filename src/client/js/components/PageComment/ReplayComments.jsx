import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'reactstrap';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import Comment from './Comment';

import { withUnstatedContainers } from '../UnstatedUtils';

class ReplayComments extends React.PureComponent {

  constructor() {
    super();

    this.state = {
      isOlderRepliesShown: false,
    };

    this.toggleOlderReplies = this.toggleOlderReplies.bind(this);
  }

  toggleOlderReplies() {
    this.setState({ isOlderRepliesShown: !this.state.isOlderRepliesShown });
  }

  renderReply(reply) {
    return (
      <div key={reply._id} className="page-comment-reply ml-4 ml-sm-5 mr-3">
        <Comment
          comment={reply}
          deleteBtnClicked={this.props.deleteBtnClicked}
          growiRenderer={this.props.growiRenderer}
        />
      </div>
    );
  }

  render() {

    const isAllReplyShown = this.props.appContainer.getConfig().isAllReplyShown || false;
    const replyList = this.props.replyList;

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
            <Collapse isOpen={this.state.isOlderRepliesShown}>
              <div>{hiddenElements}</div>
            </Collapse>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link"
                onClick={this.toggleOlderReplies}
              >
                {toggleButtonIcon} {toggleButtonLabel}
              </button>
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
const ReplayCommentsWrapper = withUnstatedContainers(ReplayComments, [AppContainer, PageContainer]);

ReplayComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  growiRenderer: PropTypes.object.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  replyList: PropTypes.array,
};

export default ReplayCommentsWrapper;
