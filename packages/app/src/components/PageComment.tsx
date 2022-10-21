import React, {
  FC, useState, useMemo, memo, useCallback,
} from 'react';

import { IRevisionHasId, isPopulated, getIdForRef } from '@growi/core';
import dynamic from 'next/dynamic';
import { Button } from 'reactstrap';

import { toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { RendererOptions } from '~/services/renderer/renderer';
import { useCommentForCurrentPageOptions } from '~/stores/renderer';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';
import { useSWRxPageComment } from '../stores/comment';

import { Comment } from './PageComment/Comment';
import { CommentEditorProps } from './PageComment/CommentEditor';
import { DeleteCommentModalProps } from './PageComment/DeleteCommentModal';
import { ReplyComments } from './PageComment/ReplyComments';
import { PageCommentSkelton } from './PageCommentSkelton';

import styles from './PageComment.module.scss';

const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });
const DeleteCommentModal = dynamic<DeleteCommentModalProps>(
  () => import('./PageComment/DeleteCommentModal').then(mod => mod.DeleteCommentModal), { ssr: false },
);

export type PageCommentProps = {
  rendererOptions?: RendererOptions,
  pageId: string,
  revision: string | IRevisionHasId,
  currentUser: any,
  isReadOnly: boolean,
  titleAlign?: 'center' | 'left' | 'right',
  highlightKeywords?: string[],
  hideIfEmpty?: boolean,
}

export const PageComment: FC<PageCommentProps> = memo((props:PageCommentProps): JSX.Element => {

  const {
    rendererOptions: rendererOptionsByProps,
    pageId, revision, currentUser, highlightKeywords, isReadOnly, titleAlign, hideIfEmpty,
  } = props;

  const { data: comments, mutate } = useSWRxPageComment(pageId);
  const { data: rendererOptionsForCurrentPage } = useCommentForCurrentPageOptions();

  const [commentToBeDeleted, setCommentToBeDeleted] = useState<ICommentHasId | null>(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState<boolean>(false);
  const [showEditorIds, setShowEditorIds] = useState<Set<string>>(new Set());
  const [errorMessageOnDelete, setErrorMessageOnDelete] = useState<string>('');

  const commentsFromOldest = useMemo(() => (comments != null ? [...comments].reverse() : null), [comments]);
  const commentsExceptReply: ICommentHasIdList | undefined = useMemo(
    () => commentsFromOldest?.filter(comment => comment.replyTo == null), [commentsFromOldest],
  );
  const allReplies = {};

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

  const removeShowEditorId = useCallback((commentId: string) => {
    setShowEditorIds((previousState) => {
      const previousShowEditorIds = new Set(...previousState);
      previousShowEditorIds.delete(commentId);
      return previousShowEditorIds;
    });
  }, []);

  if (hideIfEmpty && comments?.length === 0) {
    return <></>;
  }

  let commentTitleClasses = 'border-bottom py-3 mb-3';
  commentTitleClasses = titleAlign != null ? `${commentTitleClasses} text-${titleAlign}` : `${commentTitleClasses} text-center`;

  const rendererOptions = rendererOptionsByProps ?? rendererOptionsForCurrentPage;

  if (commentsFromOldest == null || commentsExceptReply == null || rendererOptions == null) {
    if (hideIfEmpty) {
      return <></>;
    }
    return (
      <PageCommentSkelton commentTitleClasses={commentTitleClasses}/>
    );
  }

  const revisionId = getIdForRef(revision);
  const revisionCreatedAt = (isPopulated(revision)) ? revision.createdAt : undefined;

  const generateCommentElement = (comment: ICommentHasId) => (
    <Comment
      rendererOptions={rendererOptions}
      comment={comment}
      revisionId={revisionId}
      revisionCreatedAt={revisionCreatedAt as Date}
      currentUser={currentUser}
      isReadOnly={isReadOnly}
      highlightKeywords={highlightKeywords}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
    />
  );

  const generateReplyCommentsElement = (replyComments: ICommentHasIdList) => (
    <ReplyComments
      rendererOptions={rendererOptions}
      isReadOnly={isReadOnly}
      revisionId={revisionId}
      revisionCreatedAt={revisionCreatedAt as Date}
      currentUser={currentUser}
      replyList={replyComments}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
    />
  );

  return (
    <>
      <div id="page-comments" className={`${styles['page-comment-styles']} page-comments-row comment-list`}>
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
                    {generateCommentElement(comment)}
                    {hasReply && generateReplyCommentsElement(allReplies[comment._id])}
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
                    {(!isReadOnly && showEditorIds.has(comment._id)) && (
                      <CommentEditor
                        pageId={pageId}
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
      {!isReadOnly && (
        <DeleteCommentModal
          isShown={isDeleteConfirmModalShown}
          comment={commentToBeDeleted}
          errorMessage={errorMessageOnDelete}
          cancelToDelete={onCancelDeleteComment}
          confirmToDelete={onDeleteComment}
        />
      )}
    </>
  );
});

PageComment.displayName = 'PageComment';
