import React, {
  FC, useEffect, useState, useMemo, memo, useCallback,
} from 'react';

import { Button } from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';
import { useSWRxPageComment } from '../stores/comment';


import Comment from './PageComment/Comment';
import CommentEditor from './PageComment/CommentEditor';
import DeleteCommentModal from './PageComment/DeleteCommentModal';
import ReplayComments from './PageComment/ReplayComments';

type Props = {
  appContainer: AppContainer,
  pageId: string,
  isReadOnly : boolean,
  titleAlign?: 'center' | 'left' | 'right',
  highlightKeywords?:string[],
  hideIfEmpty?: boolean,
}


const PageComment:FC<Props> = memo((props:Props):JSX.Element => {

  const {
    appContainer, pageId, highlightKeywords, isReadOnly, titleAlign, hideIfEmpty,
  } = props;

  const { data: comments, mutate } = useSWRxPageComment(pageId);

  const [commentToBeDeleted, setCommentToBeDeleted] = useState<ICommentHasId | null>(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState<boolean>(false);
  const [showEditorIds, setShowEditorIds] = useState<Set<string>>(new Set());
  const [formatedComments, setFormatedComments] = useState<ICommentHasIdList | null>(null);
  const [errorMessageOnDelete, setErrorMessageOnDelete] = useState<string>('');

  const commentsFromOldest = useMemo(() => (formatedComments != null ? [...formatedComments].reverse() : null), [formatedComments]);
  const commentsExceptReply: ICommentHasIdList | undefined = useMemo(
    () => commentsFromOldest?.filter(comment => comment.replyTo == null), [commentsFromOldest],
  );
  const allReplies = {};

  const highlightComment = useCallback((comment: string):string => {
    if (highlightKeywords == null) return comment;

    let highlightedComment = '';
    highlightKeywords.forEach((highlightKeyword) => {
      highlightedComment = comment.replaceAll(highlightKeyword, '<em class="highlighted-keyword">$&</em>');
    });
    return highlightedComment;
  }, [highlightKeywords]);

  useEffect(() => {

    if (comments != null) {
      const preprocessedCommentList: string[] = comments.map((comment) => {
        const highlightedComment: string = highlightComment(comment.comment);
        return highlightedComment;
      });
      const preprocessedComments: ICommentHasIdList = comments.map((comment, index) => {
        return { ...comment, comment: preprocessedCommentList[index] };
      });
      setFormatedComments(preprocessedComments);
    }

  }, [comments, highlightComment]);

  if (commentsFromOldest != null) {
    commentsFromOldest.forEach((comment) => {
      if (comment.replyTo != null) {
        allReplies[comment.replyTo] = allReplies[comment.replyTo] == null ? [comment] : [...allReplies[comment.replyTo], comment];
      }
    });
  }

  const onClickDeleteButton = useCallback((comment: ICommentHasId) => {
    setCommentToBeDeleted(comment);
    setIsDeleteConfirmModalShown(true);
  }, []);

  const onCancelDeleteComment = useCallback(() => {
    setCommentToBeDeleted(null);
    setIsDeleteConfirmModalShown(false);
  }, []);

  const onDeleteCommentAfterOperation = useCallback(() => {
    onCancelDeleteComment();
    mutate();
  }, [mutate, onCancelDeleteComment]);

  const onDeleteComment = useCallback(async() => {
    if (commentToBeDeleted == null) return;
    try {
      await apiPost('/comments.remove', { comment_id: commentToBeDeleted._id });
      onDeleteCommentAfterOperation();
    }
    catch (error:unknown) {
      setErrorMessageOnDelete(error as string);
      toastError(`error: ${error}`);
    }
  }, [commentToBeDeleted, onDeleteCommentAfterOperation]);

  const generateCommentInnerElement = (comment: ICommentHasId) => (
    <Comment
      growiRenderer={appContainer.getRenderer('comment')}
      deleteBtnClicked={onClickDeleteButton}
      comment={comment}
      onComment={mutate}
      isReadOnly={isReadOnly}
    />
  );

  const generateAllRepliesElement = (replyComments: ICommentHasIdList) => (
    <ReplayComments
      replyList={replyComments}
      deleteBtnClicked={onClickDeleteButton}
      growiRenderer={appContainer.getRenderer('comment')}
      isReadOnly={isReadOnly}
    />
  );

  const removeShowEditorId = useCallback((commentId: string) => {
    setShowEditorIds((previousState) => {
      const previousShowEditorIds = new Set(...previousState);
      previousShowEditorIds.delete(commentId);
      return previousShowEditorIds;
    });
  }, []);


  if (commentsFromOldest == null || commentsExceptReply == null) return <></>;

  if (hideIfEmpty && comments?.length === 0) {
    return <></>;
  }

  let commentTitleClasses = 'border-bottom py-3 mb-3';
  commentTitleClasses = titleAlign != null ? `${commentTitleClasses} text-${titleAlign}` : `${commentTitleClasses} text-center`;

  return (
    <>
      <div className="page-comments-row comment-list">
        <div className="container-lg">
          <div className="page-comments">
            <h2 className={commentTitleClasses}><i className="icon-fw icon-bubbles"></i>Comments</h2>
            <div className="page-comments-list" id="page-comments-list">
              { commentsExceptReply.map((comment) => {

                const defaultCommentThreadClasses = 'page-comment-thread pb-5';
                const hasReply: boolean = Object.keys(allReplies).includes(comment._id);

                let commentThreadClasses = '';
                commentThreadClasses = hasReply ? `${defaultCommentThreadClasses} page-comment-thread-no-replies` : defaultCommentThreadClasses;

                return (
                  <div key={comment._id} className={commentThreadClasses}>
                    {/* display comment */}
                    {generateCommentInnerElement(comment)}
                    {/* display reply comment */}
                    {hasReply && generateAllRepliesElement(allReplies[comment._id])}
                    {/* display reply button */}
                    {(!isReadOnly && !showEditorIds.has(comment._id)) && (
                      <div className="text-right">
                        <Button
                          outline
                          color="secondary"
                          size="sm"
                          className="btn-comment-reply"
                          onClick={() => {
                            setShowEditorIds(previousState => new Set(previousState.add(comment._id)));
                          }}
                        >
                          <i className="icon-fw icon-action-undo"></i> Reply
                        </Button>
                      </div>
                    )}
                    {/* display reply editor */}
                    {(!isReadOnly && showEditorIds.has(comment._id)) && (
                      <CommentEditor
                        growiRenderer={appContainer.getRenderer('comment')}
                        replyTo={comment._id}
                        onCancelButtonClicked={() => {
                          removeShowEditorId(comment._id);
                        }}
                        onCommentButtonClicked={() => {
                          removeShowEditorId(comment._id);
                          mutate();
                        }}
                      />
                    )}
                  </div>
                );

              })}
            </div>
          </div>
        </div>
      </div>
      {(!isReadOnly && commentToBeDeleted != null) && (
        <DeleteCommentModal
          isShown={isDeleteConfirmModalShown}
          comment={commentToBeDeleted}
          errorMessage={errorMessageOnDelete}
          cancel={onCancelDeleteComment}
          confirmedToDelete={onDeleteComment}
        />
      )}
    </>
  );
});

PageComment.displayName = 'PageComment';

export default PageComment;
