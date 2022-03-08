import React, { FC, memo, useMemo } from 'react';

import { UserPicture } from '@growi/ui';
import AppContainer from '~/client/services/AppContainer';

import Username from './User/Username';
import FormattedDistanceDate from './FormattedDistanceDate';
import HistoryIcon from './Icons/HistoryIcon';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';

import { useSWRxPageComment } from '../stores/comment';


type Props = {
  appContainer: AppContainer,
  pageId: string,
  highlightKeywords?:string[],
}

const PageCommentList:FC<Props> = memo((props:Props):JSX.Element => {

  const { appContainer, pageId, highlightKeywords } = props;

  const { data: comments } = useSWRxPageComment(pageId);

  const commentsFromOldest = useMemo(() => (comments != null ? [...comments].reverse() : null), [comments]);
  const commentsExceptReply: ICommentHasIdList | undefined = useMemo(
    () => commentsFromOldest?.filter(comment => comment.replyTo == null), [commentsFromOldest],
  );
  const allReplies = {};

  if (commentsFromOldest != null) {
    commentsFromOldest.forEach((comment) => {
      if (comment.replyTo != null) {
        allReplies[comment.replyTo] = comment;
      }
    });
  }

  const highlightComment = (comment: string) => {
    let highlightedComment = '';
    highlightKeywords?.forEach((highlightKeyword) => {
      highlightedComment = comment.replaceAll(highlightKeyword, '<em class="highlighted-keyword">$&</em>');
    });
    return highlightedComment;
  };

  const generateCommentInnerElement = (comment: ICommentHasId) => (
    <>
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
        <div
          className="page-comment-body text-break mt-1"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: highlightComment(comment.comment),
          }}
        />
      </div>
    </>
  );


  if (comments == null || commentsExceptReply == null) return <></>;

  return (
    <div className="comment-list border border-top mt-5 px-2">
      <h2 className="my-3 text-center"><i className="icon-fw icon-bubbles"></i>Comments</h2>

      { commentsExceptReply.map((comment) => {

        const hasReply: boolean = Object.keys(allReplies).includes(comment._id);

        return (
          <div key={comment._id} className="age-comment-main">
            {/* display comment */}
            <div className={`d-flex ${hasReply ? 'mb-3' : 'mb-5'}`}>
              {generateCommentInnerElement(comment)}
            </div>
            {/* display reply comment */}
            {hasReply && (
              <div className="d-flex ml-4 mb-5">
                {generateCommentInnerElement(allReplies[comment._id])}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
});


export default PageCommentList;
