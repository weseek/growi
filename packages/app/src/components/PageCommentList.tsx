import React, { FC, memo, useMemo } from 'react';

import { UserPicture } from '@growi/ui';
import AppContainer from '~/client/services/AppContainer';

import Username from './User/Username';
import FormattedDistanceDate from './FormattedDistanceDate';
import HistoryIcon from './Icons/HistoryIcon';

import { useSWRxPageComment } from '../stores/comment';


type Props = {
  appContainer: AppContainer,
  pageId: string,

}

const PageCommentList:FC<Props> = memo((props:Props):JSX.Element => {

  const { appContainer, pageId } = props;

  const { data: comments } = useSWRxPageComment(pageId);

  const commentsFromOldest = useMemo(() => (comments != null ? [...comments].reverse() : null), [comments]);
  const allReplies = {};

  if (commentsFromOldest != null) {
    commentsFromOldest.forEach((comment) => {
      if (comment.replyTo != null) {
        allReplies[comment.replyTo] = comment;
      }
    });
  }


  const growiRenderer = useMemo(() => appContainer.getRenderer('comment'), [appContainer]);

  if (comments == null) return <></>;

  return (
    <div className="border border-top mt-5 px-2">
      <h2 className="my-3 text-center"><i className="icon-fw icon-bubbles"></i>Comments</h2>

      { commentsFromOldest?.map((comment) => {

        const hasReply: boolean = Object.keys(allReplies).includes(comment._id);

        return (
          <div key={comment._id} className="age-comment-main">
            {/* display comment */}
            <div className={`d-flex ${hasReply ? 'mb-3' : 'mb-5'}`}>
              <div className="flex-shrink-0">
                <UserPicture user={comment.creator} size="md" noLink noTooltip />
              </div>
              <div className="flex-grow-1 ml-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <Username user={comment.creator} />
                  </div>
                  <div className="flex-grow-1 ml-3 text-right">
                    <div className="page-comment-meta">
                      <HistoryIcon />
                      <a href={`#${comment._id}`}>
                        <FormattedDistanceDate id={comment._id} date={comment.createdAt} />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="page-comment-body mt-1">{comment.comment}</div>
              </div>
            </div>
            {/* display reply comment */}
            {hasReply && (
              <div className="d-flex ml-4 mb-5">
                <div className="flex-shrink-0">
                  <UserPicture user={allReplies[comment._id].creator} size="md" noLink noTooltip />
                </div>
                <div className="flex-grow-1 ml-3">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <Username user={allReplies[comment._id].creator} />
                    </div>
                    <div className="flex-grow-1 ml-3 text-right">
                      <div className="page-comment-meta">
                        <HistoryIcon />
                        <a href={`#${allReplies[comment._id]._id}`}>
                          <FormattedDistanceDate id={allReplies[comment._id]._id} date={allReplies[comment._id].createdAt} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="page-comment-body mt-1">{allReplies[comment._id].comment}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
});


export default PageCommentList;
