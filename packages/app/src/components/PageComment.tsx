import React, {
  FC, useEffect, useState, useMemo, memo, useCallback,
} from 'react';

import dynamic from 'next/dynamic';
import { Button } from 'reactstrap';

import { toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { useCurrentPagePath } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import { useCommentPreviewOptions } from '~/stores/renderer';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';
import { useSWRxPageComment } from '../stores/comment';

import { Comment } from './PageComment/Comment';
import { CommentEditorProps } from './PageComment/CommentEditor';
import { CommentEditorLazyRenderer } from './PageComment/CommentEditorLazyRenderer';
import { DeleteCommentModalProps } from './PageComment/DeleteCommentModal';
import { ReplyComments } from './PageComment/ReplyComments';
import { PageCommentSkelton } from './PageCommentSkelton';

import styles from './PageComment.module.scss';

const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });
const DeleteCommentModal = dynamic<DeleteCommentModalProps>(
  () => import('./PageComment/DeleteCommentModal').then(mod => mod.DeleteCommentModal), { ssr: false },
);


type PageCommentProps = {
  pageId?: string,
  isReadOnly: boolean,
  titleAlign?: 'center' | 'left' | 'right',
  highlightKeywords?: string[],
  hideIfEmpty?: boolean,
}

export const PageComment: FC<PageCommentProps> = memo((props:PageCommentProps): JSX.Element => {

  const {
    pageId, highlightKeywords, isReadOnly, titleAlign, hideIfEmpty,
  } = props;

  const { data: comments, mutate } = useSWRxPageComment(pageId);
  const { data: rendererOptions } = useCommentPreviewOptions();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: currentPagePath } = useCurrentPagePath();

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

  if (commentsFromOldest == null || commentsExceptReply == null || rendererOptions == null || currentPagePath == null || currentPage == null) {
    if (hideIfEmpty) {
      return <></>;
    }
    return (
      <PageCommentSkelton commentTitleClasses={commentTitleClasses}/>
    );
  }

  const generateCommentElement = (comment: ICommentHasId) => (
    <Comment
      comment={comment}
      isReadOnly={isReadOnly}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
      rendererOptions={rendererOptions}
      currentPagePath={currentPagePath}
      currentRevisionId={currentPage.revision._id}
      currentRevisionCreatedAt={currentPage.revision.createdAt}
    />
  );

  const generateReplyCommentElements = (replyComments: ICommentHasIdList) => (
    <ReplyComments
      isReadOnly={isReadOnly}
      replyList={replyComments}
      deleteBtnClicked={onClickDeleteButton}
      onComment={mutate}
      rendererOptions={rendererOptions}
      currentPagePath={currentPagePath}
      currentRevisionId={currentPage.revision._id}
      currentRevisionCreatedAt={currentPage.revision.createdAt}
    />
  );

  return (
    <>
      {/* TODO: Check the comment.html CSS */}
      <div className={`${styles['page-comment-styles']} page-comments-row comment-list`}>
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
                    {hasReply && generateReplyCommentElements(allReplies[comment._id])}
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
                        rendererOptions={rendererOptions}
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
            {/* TODO: Check if identical-page */}
            <CommentEditorLazyRenderer
              pageId={pageId}
              rendererOptions={rendererOptions}
            />
          </div>
        </div>
      </div>
      {(!isReadOnly) && (
        <DeleteCommentModal
          isShown={isDeleteConfirmModalShown}
          comment={commentToBeDeleted}
          errorMessage={errorMessageOnDelete}
          cancelToDelete={onCancelDeleteComment}
          confirmeToDelete={onDeleteComment}
        />
      )}
    </>
  );
});

PageComment.displayName = 'PageComment';
