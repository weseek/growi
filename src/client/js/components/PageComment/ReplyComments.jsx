import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'reactstrap';

import Comment from '~/components/PageComment/Comment';

import PageContainer from '../../services/PageContainer';

import { withUnstatedContainers } from '../UnstatedUtils';
import { useIsAllReplyShown } from '~/stores/context';

class ReplyComments extends React.PureComponent {

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
        />
      </div>
    );
  }

  render() {

    const isAllReplyShown = this.props.isAllReplyShown;
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

ReplyComments.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isAllReplyShown: PropTypes.bool.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  replyList: PropTypes.array,
};

const ReplyCommentsWrapper = (props) => {
  const { data: isAllReplyShown } = useIsAllReplyShown();
  return <ReplyComments {...props} isAllReplyShown={isAllReplyShown} />;
};


/**
 * Wrapper component for using unstated
 */
const ReplyCommentsWrapperWrapper = withUnstatedContainers(ReplyCommentsWrapper, [PageContainer]);

export default ReplyCommentsWrapperWrapper;
