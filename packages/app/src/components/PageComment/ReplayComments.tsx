
import React, { useState } from 'react';

import { Collapse } from 'reactstrap';

import { ICommentHasId, ICommentHasIdList } from '../../interfaces/comment';
import { useRendererConfig } from '../../stores/context';

import Comment from './Comment';

type ReplaycommentsProps = {
  deleteBtnClicked: (comment: ICommentHasId) => void,
  isReadOnly: boolean,
  replyList: ICommentHasIdList,
  onComment: () => void,
}

export const ReplayComments = (props: ReplaycommentsProps): JSX.Element => {
  const {
    deleteBtnClicked, isReadOnly, replyList, onComment,
  } = props;
  const { data: rendererConfig } = useRendererConfig();

  const [isOlderRepliesShown, setIsOlderRepliesShown] = useState(false);

  const renderReply = (reply: ICommentHasId) => {
    return (
      <div key={reply._id} className="page-comment-reply ml-4 ml-sm-5 mr-3">
        {/* TODO: Update props */}
        <Comment
          comment={reply}
          deleteBtnClicked={deleteBtnClicked}
          isReadOnly={isReadOnly}
          onComment={onComment}
        />
      </div>
    );
  };

  // TODO: Remove isAllReplyShown from rendererconfig
  if (rendererConfig === undefined) {
    return <></>;
  }
  const isAllReplyShown = rendererConfig.isAllReplyShown || false;

  if (isAllReplyShown) {
    return (
      <>
        {replyList.map((reply) => {
          return renderReply(reply);
        })}
      </>
    );
  }

  const areThereHiddenReplies = (replyList.length > 2);

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
    <>
      {areThereHiddenReplies && (
        <div className="page-comments-hidden-replies">
          <Collapse isOpen={isOlderRepliesShown}>
            <div>{hiddenElements}</div>
          </Collapse>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setIsOlderRepliesShown(!isOlderRepliesShown)}
            >
              {toggleButtonIcon} {toggleButtonLabel}
            </button>
          </div>
        </div>
      )}
      {shownElements}
    </>
  );
};
