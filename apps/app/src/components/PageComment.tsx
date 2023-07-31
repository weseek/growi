import React, {
  FC, useState, useMemo, memo, useCallback,
} from 'react';

import { isPopulated, getIdForRef } from '@growi/core/dist/interfaces/common';
import { type IRevisionHasId } from '@growi/core/dist/interfaces/revision';
import { Button } from 'reactstrap';

import { apiPost } from '~/client/util/apiv1-client';
import { toastError } from '~/client/util/toastr';
import { RendererOptions } from '~/interfaces/renderer-options';
import { useSWRMUTxPageInfo } from '~/stores/page';
import { useCommentForCurrentPageOptions } from '~/stores/renderer';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';
import { useSWRxPageComment } from '../stores/comment';

import { NotAvailableForGuest } from './NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from './NotAvailableForReadOnlyUser';
import { Comment } from './PageComment/Comment';
import { CommentEditor } from './PageComment/CommentEditor';
import { DeleteCommentModal } from './PageComment/DeleteCommentModal';
import { ReplyComments } from './PageComment/ReplyComments';

import styles from './PageComment.module.scss';

export const ROOT_ELEM_ID = 'page-comments' as const;

// Always render '#page-comments' for MutationObserver of SearchResultContent
const PageCommentRoot = (props: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div id={ROOT_ELEM_ID} {...props}>{props.children}</div>
);


export type PageCommentProps = {
  rendererOptions?: RendererOptions,
  pageId: string,
  pagePath: string,
  revision: string | IRevisionHasId,
  currentUser: any,
  isReadOnly: boolean,
  titleAlign?: 'center' | 'left' | 'right',
  hideIfEmpty?: boolean,
}

export const PageComment: FC<PageCommentProps> = memo((props: PageCommentProps): JSX.Element => {

  const {
    rendererOptions: rendererOptionsByProps,
    pageId, pagePath, revision, currentUser, isReadOnly, titleAlign, hideIfEmpty,
  } = props;

  const { data: comments, mutate } = useSWRxPageComment(pageId);
  const { data: rendererOptionsForCurrentPage } = useCommentForCurrentPageOptions();

  const [commentToBeDeleted, setCommentToBeDeleted] = useState<ICommentHasId | null>(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState<boolean>(false);
  const [showEditorIds, setShowEditorIds] = useState<Set<string>>(new Set());
  const [errorMessageOnDelete, setErrorMessageOnDelete] = useState<string>('');
  const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(pageId);

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
    mutatePageInfo();
  }, [mutate, onCancelDeleteComment, mutatePageInfo]);

  const onDeleteComment = useCallback(async() => {
    if (commentToBeDeleted == null) return;
    try {
      await apiPost('/comments.remove', { comment_id: commentToBeDeleted._id });
      onDeleteCommentAfterOperation();
    }
    catch (error: unknown) {
      setErrorMessageOnDelete(error as string);
      toastError(`error: ${error}`);
    }
  }, [commentToBeDeleted, onDeleteCommentAfterOperation]);

  const removeShowEditorId = useCallback((commentId: string) => {
    setShowEditorIds((previousState) => {
      return new Set([...previousState].filter(id => id !== commentId));
    });
  }, []);

  const onReplyButtonClickHandler = useCallback((commentId: string) => {
    setShowEditorIds(previousState => new Set([...previousState, commentId]));
  }, []);

  const onCommentButtonClickHandler = useCallback((commentId: string) => {
    removeShowEditorId(commentId);
    mutate();
    mutatePageInfo();
  }, [removeShowEditorId, mutate, mutatePageInfo]);

  if (hideIfEmpty && comments?.length === 0) {
    return <PageCommentRoot />;
  }

  let commentTitleClasses = 'border-bottom py-3 mb-3';
  commentTitleClasses = titleAlign != null ? `${commentTitleClasses} text-${titleAlign}` : `${commentTitleClasses} text-center`;

  const rendererOptions = rendererOptionsByProps ?? rendererOptionsForCurrentPage;

  if (commentsFromOldest == null || commentsExceptReply == null || rendererOptions == null) {
    if (hideIfEmpty) {
      return <PageCommentRoot />;
    }
    return (
      <></>
    );
  }

  const revisionId = getIdForRef(revision);
  const revisionCreatedAt = (isPopulated(revision)) ? revision.createdAt : undefined;

  const commentElement = (comment: ICommentHasId) => (
    <Comment
      rendererOptions={rendererOptions}
      comment={comment}
      revisionId={revisionId}
      revisionCreatedAt={revisionCreatedAt as Date}
      currentUser={currentUser}
      isReadOnly={isReadOnly}
      pageId={pageId}
      pagePath={pagePath}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
    />
  );

  const replyCommentsElement = (replyComments: ICommentHasIdList) => (
    <ReplyComments
      rendererOptions={rendererOptions}
      isReadOnly={isReadOnly}
      revisionId={revisionId}
      revisionCreatedAt={revisionCreatedAt as Date}
      currentUser={currentUser}
      replyList={replyComments}
      pageId={pageId}
      pagePath={pagePath}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
    />
  );

  return (
    <PageCommentRoot className={`${styles['page-comment-styles']} page-comments-row comment-list`}>
      <div className="container-lg">
        <div className="page-comments">
          <h2 className={commentTitleClasses}><i className="icon-fw icon-bubbles"></i>Comments</h2>
          <div className="page-comments-list" id="page-comments-list">
            {commentsExceptReply.map((comment) => {

              const defaultCommentThreadClasses = 'page-comment-thread pb-5';
              const hasReply: boolean = Object.keys(allReplies).includes(comment._id);

              let commentThreadClasses = '';
              commentThreadClasses = hasReply ? `${defaultCommentThreadClasses} page-comment-thread-no-replies` : defaultCommentThreadClasses;

              return (
                <div key={comment._id} className={commentThreadClasses}>
                  {commentElement(comment)}
                  {hasReply && replyCommentsElement(allReplies[comment._id])}
                  {(!isReadOnly && !showEditorIds.has(comment._id)) && (
                    <div className="d-flex flex-row-reverse">
                      <NotAvailableForGuest>
                        <NotAvailableForReadOnlyUser>
                          <Button
                            data-testid="comment-reply-button"
                            outline
                            color="secondary"
                            size="sm"
                            className="btn-comment-reply"
                            onClick={() => onReplyButtonClickHandler(comment._id)}
                          >
                            <i className="icon-fw icon-action-undo"></i> Reply
                          </Button>
                        </NotAvailableForReadOnlyUser>
                      </NotAvailableForGuest>
                    </div>
                  )}
                  {(!isReadOnly && showEditorIds.has(comment._id)) && (
                    <CommentEditor
                      pageId={pageId}
                      replyTo={comment._id}
                      onCancelButtonClicked={() => {
                        removeShowEditorId(comment._id);
                      }}
                      onCommentButtonClicked={() => onCommentButtonClickHandler(comment._id)}
                      revisionId={revisionId}
                    />
                  )}
                </div>
              );

            })}
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
    </PageCommentRoot>
  );
});

PageComment.displayName = 'PageComment';
