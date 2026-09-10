import type { FC, JSX } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import type { IRevision, Ref } from '@growi/core';
import { getIdStringForRef, isPopulated } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { parseISO } from 'date-fns/parseISO';
import { useTranslation } from 'next-i18next';

import { apiPost } from '~/client/util/apiv1-client';
import { toastError } from '~/client/util/toastr';
import { InlineCommentItem } from '~/features/inline-comment/client/components/InlineCommentItem/InlineCommentItem';
import type { InlineCommentWithReplies } from '~/features/inline-comment/interfaces';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useSWRMUTxPageInfo } from '~/stores/page';
import { useCommentForCurrentPageOptions } from '~/stores/renderer';

import type {
  ICommentHasId,
  ICommentHasIdList,
} from '../../interfaces/comment';
import { useSWRxPageComment } from '../../stores/comment';
import { NotAvailableForGuest } from './NotAvailableForGuest';
import { NotAvailableIfReadOnlyUserNotAllowedToComment } from './NotAvailableForReadOnlyUser';
import { Comment } from './PageComment/Comment';
import { CommentEditor } from './PageComment/CommentEditor';
import { DeleteCommentModalLazyLoaded } from './PageComment/DeleteCommentModal';
import { ReplyComments } from './PageComment/ReplyComments';

import styles from './PageComment.module.scss';

type PageCommentProps = {
  rendererOptions?: RendererOptions;
  pageId: string;
  pagePath: string;
  revision: Ref<IRevision>;
  currentUser: any;
  isReadOnly: boolean;
  /**
   * The page's inline comments together with the writers that revalidate
   * them, supplied by the caller (design.md 決定3): this component must not
   * fetch them itself, because `Comments` is also mounted by
   * `ShareLinkPageView`, where inline comments must never be requested
   * (requirement 13.8).
   *
   * The three values travel as one object because they belong to one
   * `useSWRxInlineComments` call — `resolve`/`createReply` revalidate exactly
   * the list held in `comments`. Bundling them also makes "all three or none"
   * a type rather than a convention, so a caller cannot supply a list whose
   * resolve toggle silently does nothing.
   *
   * Omitted by callers that show no inline comments at all (the share-link
   * view, and the search-result preview in `SearchResultContent`).
   */
  inlineComments?: {
    comments: InlineCommentWithReplies[];
    resolve: (id: string, resolved: boolean) => Promise<unknown>;
    createReply: (parentId: string, comment: string) => Promise<unknown>;
    /** Persists an edited origin-comment body (Requirement 18.1, 18.2). */
    update: (id: string, comment: string) => Promise<unknown>;
    /** Deletes the origin comment, along with its replies (Requirement 18.5, 18.6). */
    remove: (id: string) => Promise<unknown>;
    /** Persists an edited reply body (Requirement 18.1, 18.2). */
    updateReply: (id: string, comment: string) => Promise<unknown>;
    /** Deletes a single reply (Requirement 18.5). */
    removeReply: (id: string) => Promise<unknown>;
    /**
     * Scrolls the page body to the highlighted range this comment anchors
     * to; returns `false` when the range no longer resolves (failed
     * re-anchor) so the caller can surface that instead of scrolling to
     * nothing (design.md 決定4 / Requirement 3.1, 3.2). Wired to the anchored
     * quote's click handler inside `InlineCommentItem`.
     */
    scrollToRange: (commentId: string) => boolean;
  };
};

/**
 * One entry of the merged list. Replies are NOT entries — they stay nested
 * under their parent, as they were before the two lists were merged.
 */
type CommentListItem =
  | { kind: 'normal'; sortKey: number; comment: ICommentHasId }
  | { kind: 'inline'; sortKey: number; comment: InlineCommentWithReplies };

/**
 * `createdAt` is declared as `Date` on both comment interfaces but actually
 * arrives as an ISO string, because the value is whatever the API's JSON
 * carried (see the same workaround in `Comment.tsx`). Subtracting two strings
 * yields `NaN`, which would silently turn the sort into a no-op, so parse
 * before comparing.
 */
const toSortKey = (createdAt: Date | string): number =>
  (typeof createdAt === 'string' ? parseISO(createdAt) : createdAt).valueOf();

export const PageComment: FC<PageCommentProps> = memo(
  (props: PageCommentProps): JSX.Element => {
    const {
      rendererOptions: rendererOptionsByProps,
      pageId,
      pagePath,
      revision,
      currentUser,
      isReadOnly,
      inlineComments: inline,
    } = props;

    const { data: comments, mutate } = useSWRxPageComment(pageId);
    const { data: rendererOptionsForCurrentPage } =
      useCommentForCurrentPageOptions();

    const [commentToBeDeleted, setCommentToBeDeleted] =
      useState<ICommentHasId | null>(null);
    const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] =
      useState<boolean>(false);
    const [showEditorIds, setShowEditorIds] = useState<Set<string>>(new Set());
    const [errorMessageOnDelete, setErrorMessageOnDelete] =
      useState<string>('');
    const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(pageId);

    const { t } = useTranslation('');

    const commentsFromOldest = useMemo(
      () => (comments != null ? [...comments].reverse() : null),
      [comments],
    );
    const commentsExceptReply: ICommentHasIdList | undefined = useMemo(
      () => commentsFromOldest?.filter((comment) => comment.replyTo == null),
      [commentsFromOldest],
    );
    /**
     * The single list requirement 13.1/13.2 asks for: origin normal comments
     * and inline comments interleaved by posting date, ascending.
     */
    const items = useMemo<CommentListItem[]>(
      () =>
        [
          ...(commentsExceptReply ?? []).map(
            (comment): CommentListItem => ({
              kind: 'normal',
              sortKey: toSortKey(comment.createdAt),
              comment,
            }),
          ),
          ...(inline?.comments ?? []).map(
            (comment): CommentListItem => ({
              kind: 'inline',
              sortKey: toSortKey(comment.createdAt),
              comment,
            }),
          ),
        ].sort((a, b) => a.sortKey - b.sortKey),
      [commentsExceptReply, inline?.comments],
    );

    const allReplies = {};

    if (commentsFromOldest != null) {
      commentsFromOldest.forEach((comment) => {
        if (comment.replyTo != null) {
          allReplies[comment.replyTo] =
            allReplies[comment.replyTo] == null
              ? [comment]
              : [...allReplies[comment.replyTo], comment];
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

    const onDeleteComment = useCallback(async () => {
      if (commentToBeDeleted == null) return;
      try {
        await apiPost('/comments.remove', {
          comment_id: commentToBeDeleted._id,
        });
        onDeleteCommentAfterOperation();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : (error as any).toString();

        setErrorMessageOnDelete(message);
        toastError(message);
      }
    }, [commentToBeDeleted, onDeleteCommentAfterOperation]);

    const removeShowEditorId = useCallback((commentId: string) => {
      setShowEditorIds((previousState) => {
        return new Set([...previousState].filter((id) => id !== commentId));
      });
    }, []);

    const onReplyButtonClickHandler = useCallback((commentId: string) => {
      setShowEditorIds(
        (previousState) => new Set([...previousState, commentId]),
      );
    }, []);

    const onCommentButtonClickHandler = useCallback(
      (commentId: string) => {
        removeShowEditorId(commentId);
        mutate();
        mutatePageInfo();
      },
      [removeShowEditorId, mutate, mutatePageInfo],
    );

    const rendererOptions =
      rendererOptionsByProps ?? rendererOptionsForCurrentPage;

    // Nothing to show when neither kind of comment is present. Note this is
    // checked on the merged list, not on the normal comments alone: a page
    // whose only comments are inline ones must still render the list.
    if (items.length === 0 || rendererOptions == null) {
      return <></>;
    }

    const revisionId = getIdStringForRef(revision);
    const revisionCreatedAt = isPopulated(revision)
      ? revision.createdAt
      : undefined;

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
      <div
        className={`${styles['page-comment-styles']} page-comments-row comment-list`}
      >
        <div className="page-comments">
          <div className="page-comments-list mb-3" id="page-comments-list">
            {items.map((item) => {
              // An inline comment brings its own box, quote and replies, so it
              // only needs the same thread wrapper the normal comments use.
              if (item.kind === 'inline') {
                // Unreachable: an inline item only exists when `inline` was
                // supplied. The guard is what lets TypeScript see that.
                if (inline == null) return null;

                return (
                  <div
                    key={`inline-${item.comment.id}`}
                    className="page-comment-thread mb-2"
                  >
                    <InlineCommentItem
                      comment={item.comment}
                      rendererOptions={rendererOptions}
                      resolve={inline.resolve}
                      createReply={inline.createReply}
                      update={inline.update}
                      remove={inline.remove}
                      updateReply={inline.updateReply}
                      removeReply={inline.removeReply}
                      scrollToRange={inline.scrollToRange}
                    />
                  </div>
                );
              }

              const comment = item.comment;
              const defaultCommentThreadClasses = 'page-comment-thread mb-2';
              const hasReply: boolean = Object.keys(allReplies).includes(
                comment._id,
              );

              let commentThreadClasses = '';
              commentThreadClasses = hasReply
                ? `${defaultCommentThreadClasses} page-comment-thread-no-replies`
                : defaultCommentThreadClasses;

              return (
                <div
                  key={`normal-${comment._id}`}
                  className={commentThreadClasses}
                >
                  {/* Comment */}
                  {commentElement(comment)}
                  {/* Reply comments */}
                  {hasReply && replyCommentsElement(allReplies[comment._id])}

                  {!isReadOnly && !showEditorIds.has(comment._id) && (
                    <div className="d-flex flex-row-reverse">
                      <NotAvailableForGuest>
                        <NotAvailableIfReadOnlyUserNotAllowedToComment>
                          <button
                            type="button"
                            data-testid="comment-reply-button"
                            className="btn btn-secondary btn-comment-reply text-start w-100 ms-5"
                            onClick={() =>
                              onReplyButtonClickHandler(comment._id)
                            }
                          >
                            <UserPicture
                              user={currentUser}
                              noLink
                              noTooltip
                              className="me-2"
                            />
                            <span className="material-symbols-outlined me-1 fs-5 pb-1">
                              reply
                            </span>
                            <small>{t('page_comment.reply')}...</small>
                          </button>
                        </NotAvailableIfReadOnlyUserNotAllowedToComment>
                      </NotAvailableForGuest>
                    </div>
                  )}

                  {/* Editor to reply */}
                  {!isReadOnly && showEditorIds.has(comment._id) && (
                    <CommentEditor
                      pageId={pageId}
                      replyTo={comment._id}
                      onCanceled={() => {
                        removeShowEditorId(comment._id);
                      }}
                      onCommented={() =>
                        onCommentButtonClickHandler(comment._id)
                      }
                      revisionId={revisionId}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!isReadOnly && (
          <DeleteCommentModalLazyLoaded
            isShown={isDeleteConfirmModalShown}
            comment={commentToBeDeleted}
            errorMessage={errorMessageOnDelete}
            cancelToDelete={onCancelDeleteComment}
            confirmToDelete={onDeleteComment}
          />
        )}
      </div>
    );
  },
);

PageComment.displayName = 'PageComment';
