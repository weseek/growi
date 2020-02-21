import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import Collapse from 'react-bootstrap/es/Collapse';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import { createSubscribedElement } from '../UnstatedUtils';

const ReplyComments = (props) => {
  const [isOlderRepliesShown, setIsOlderRepliesShown] = useState(false);

  const toggleOlderReplies = () => {
    setIsOlderRepliesShown(!isOlderRepliesShown);
  };

  const renderReply = (reply) => {
    return (
      <div key={reply._id} className="page-comment-reply">
        {reply.comment}
        {/* <CommentWrapper
          comment={reply}
          deleteBtnClicked={props.deleteBtnClicked}
          growiRenderer={props.growiRenderer}
        /> */}
      </div>
    );
  };
  const layoutType = props.appContainer.getConfig().layoutType;
  const isBaloonStyle = layoutType.match(/crowi-plus|growi|kibela/);

  let { replyList } = props;
  if (!isBaloonStyle) {
    replyList = replyList.slice().reverse();
  }

  const areThereHiddenReplies = replyList.length > 2;

  const toggleButtonIconName = isOlderRepliesShown ? 'icon-arrow-up' : 'icon-options-vertical';
  const toggleButtonIcon = <i className={`icon-fw ${toggleButtonIconName}`}></i>;
  const toggleButtonLabel = isOlderRepliesShown ? '' : 'more';

  const shownReplies = replyList.slice(replyList.length - 2, replyList.length);
  const hiddenReplies = replyList.slice(0, replyList.length - 2);

  const hiddenElements = hiddenReplies.map((reply) => {
    return renderReply(reply);
  });

  const shownElements = shownReplies.map((reply) => {
    return renderReply(reply);
  });

  return (
    <React.Fragment>
      {areThereHiddenReplies && (
        <div className="page-comments-hidden-replies">
          <Collapse in={isOlderRepliesShown}>
            <div>{hiddenElements}</div>
          </Collapse>
          <div className="text-center">
            <Button
              bsStyle="link"
              className="page-comments-list-toggle-older"
              onClick={toggleOlderReplies}
            >
              {toggleButtonIcon} {toggleButtonLabel}
            </Button>
          </div>
        </div>
      )}

      {shownElements}
    </React.Fragment>
  );
};


/**
 * Wrapper component for using unstated
 */
const ReplyCommentsWrapper = (props) => {
  return createSubscribedElement(ReplyComments, props, [AppContainer, PageContainer]);
};

ReplyComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  replyList: PropTypes.array.isRequired,
};

export default ReplyCommentsWrapper;
