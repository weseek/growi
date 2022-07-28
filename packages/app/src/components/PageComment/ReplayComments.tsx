
import React, { useState } from 'react';

import { Collapse } from 'reactstrap';

import { RendererOptions } from '~/services/renderer/renderer';

import { ICommentHasId, ICommentHasIdList } from '../../interfaces/comment';
import { useRendererConfig } from '../../stores/context';

import { Comment } from './Comment';

type ReplaycommentsProps = {
  deleteBtnClicked: (comment: ICommentHasId) => void,
  rendererOptions: RendererOptions,
  isReadOnly: boolean,
  replyList: ICommentHasIdList,
  onComment: () => void,
}

export const ReplayComments = (props: ReplaycommentsProps): JSX.Element => {
  const {
    deleteBtnClicked, rendererOptions, isReadOnly, replyList, onComment,
  } = props;
  const { data: rendererConfig } = useRendererConfig();

  const [isOlderRepliesShown, setIsOlderRepliesShown] = useState(false);

  const renderReply = (reply: ICommentHasId) => {
    return (
      <div key={reply._id} className="page-comment-reply ml-4 ml-sm-5 mr-3">
        <Comment
          comment={reply}
          deleteBtnClicked={deleteBtnClicked}
          rendererOptions={rendererOptions}
          isReadOnly={isReadOnly}
          onComment={onComment}
        />
      </div>
    );
  };

  // TODO: Remove isAllReplyShown from rendererconfig.
  if (rendererConfig === undefined) {
    return <></>;
  }
  const isAllReplyShown = rendererConfig.isAllReplyShown || false;

  if (isAllReplyShown) {
    return (
      <React.Fragment>
        {replyList.map((reply) => {
          return renderReply(reply);
        })}
      </React.Fragment>
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
    <React.Fragment>
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

    </React.Fragment>
  );
};
