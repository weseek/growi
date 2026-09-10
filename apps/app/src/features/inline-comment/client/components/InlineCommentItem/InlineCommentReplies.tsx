/**
 * Nested reply list + reply composer for an inline comment thread.
 *
 * Reuses the page-bottom `CommentEditor` for composing replies, but its
 * `onSubmit` is overridden to route through this thread's own `createReply`
 * instead of the default comment-post path — `pageId`/`revisionId` are
 * required props of `CommentEditor` but go unread once that override is set.
 *
 * `reply.creatorId` (not the populated `creator`) is compared against
 * `currentUser._id` to decide reply ownership, matching `InlineCommentItem`.
 *
 * Edit/delete icon buttons reuse `InlineCommentItem.module.scss`'s
 * `.icon-button-container` hover-visibility rule and `.icon-button` sizing
 * rule (imported here, not duplicated): `.icon-button-container` is
 * `.inline-comment-item-styles .icon-button-container` with no `:global()`
 * wrapper, so it is a CSS-Modules-scoped selector, not a plain global class
 * name — matching it requires reading the class through `styles[...]` from
 * this exact module specifier so the compiled hash lines up with
 * `InlineCommentItem.tsx`'s. `InlineCommentReplyItem` always renders as a
 * descendant of that ancestor's root div (see `InlineCommentItem.tsx`), so
 * the `:hover` rule still reaches it. `.icon-button` is a top-level rule in
 * the same module (not nested under `.inline-comment-item-styles`), so it
 * applies regardless of ancestor.
 */

import { type FC, type JSX, useMemo, useState } from 'react';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'react-i18next';

import { NotAvailableIfReadOnlyUserNotAllowedToComment } from '~/client/components/NotAvailableForReadOnlyUser';
import { CommentCard } from '~/client/components/PageComment/CommentCard';
import { CommentEditor } from '~/client/components/PageComment/CommentEditor';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentReply } from '../../../interfaces';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';

import styles from './InlineCommentItem.module.scss';

type InlineCommentRepliesProps = {
  parentId: string;
  pageId: string;
  revisionId: string;
  replies: InlineCommentReply[];
  rendererOptions: RendererOptions | undefined;
  onSubmitReply: (parentId: string, comment: string) => Promise<unknown>;
  updateReply: (id: string, comment: string) => Promise<unknown>;
  removeReply: (id: string) => Promise<unknown>;
};

type InlineCommentReplyItemProps = {
  reply: InlineCommentReply;
  rendererOptions: RendererOptions | undefined;
  updateReply: (id: string, comment: string) => Promise<unknown>;
  removeReply: (id: string) => Promise<unknown>;
  isOwnReply: boolean;
};

const InlineCommentReplyItem: FC<InlineCommentReplyItemProps> = (
  props,
): JSX.Element => {
  const { reply, rendererOptions, updateReply, removeReply, isOwnReply } =
    props;
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const handleEditSubmit = async (text: string): Promise<void> => {
    try {
      await updateReply(reply.id, text);
      setEditError(undefined);
      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when updating the reply',
      );
      // Rethrow so MentionAwareCommentInput keeps the text instead of clearing it.
      throw err;
    }
  };

  const handleEditCancel = (): void => {
    setIsEditing(false);
    setEditError(undefined);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await removeReply(reply.id);
      setDeleteError(undefined);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when deleting the reply',
      );
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div
      data-testid="inline-comment-reply"
      className="inline-comment-reply ms-4 ms-sm-5 mt-2"
    >
      <CommentCard
        id={reply.id}
        creator={reply.creator}
        createdAt={reply.createdAt}
        headerEnd={
          isOwnReply &&
          !isEditing &&
          !isDeleteConfirmOpen && (
            <span className="ms-auto d-flex align-items-center gap-2">
              <NotAvailableIfReadOnlyUserNotAllowedToComment>
                <span
                  className={`d-flex align-items-center gap-1 ${styles['icon-button-container']}`}
                >
                  <button
                    type="button"
                    data-testid="inline-comment-reply-edit-button"
                    className={`btn btn-link opacity-50 rounded-circle ${styles['icon-button']}`}
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    type="button"
                    data-testid="inline-comment-reply-delete-button"
                    className={`btn btn-link opacity-50 text-danger rounded-circle ${styles['icon-button']}`}
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </span>
              </NotAvailableIfReadOnlyUserNotAllowedToComment>
            </span>
          )
        }
        footer={
          <>
            {editError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-reply-edit-error"
              >
                {editError}
              </span>
            )}
            {deleteError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-reply-delete-error"
              >
                {deleteError}
              </span>
            )}
            {isDeleteConfirmOpen && (
              <div
                data-testid="inline-comment-reply-delete-confirm"
                className="d-flex align-items-center gap-2 mt-1"
              >
                <span>{t('page_comment.delete_comment')}</span>
                <button
                  type="button"
                  data-testid="inline-comment-reply-delete-confirm-button"
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  {t('Delete')}
                </button>
                <button
                  type="button"
                  data-testid="inline-comment-reply-delete-cancel-button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  {t('Cancel')}
                </button>
              </div>
            )}
          </>
        }
      >
        {isEditing ? (
          <div className="inline-comment-edit-form">
            <MentionAwareCommentInput
              editorKey={`inline_comment_edit_${reply.id}`}
              initialValue={reply.comment}
              onSubmit={handleEditSubmit}
            />
            <button
              type="button"
              data-testid="inline-comment-reply-edit-cancel-button"
              className="btn btn-sm btn-outline-secondary mt-1"
              onClick={handleEditCancel}
            >
              {t('Cancel')}
            </button>
          </div>
        ) : rendererOptions != null ? (
          <RevisionRenderer
            rendererOptions={rendererOptions}
            markdown={reply.comment}
          />
        ) : (
          <span>{reply.comment}</span>
        )}
      </CommentCard>
    </div>
  );
};

export const InlineCommentReplies: FC<InlineCommentRepliesProps> = (
  props,
): JSX.Element => {
  const {
    parentId,
    pageId,
    revisionId,
    replies,
    rendererOptions,
    onSubmitReply,
    updateReply,
    removeReply,
  } = props;
  const { t } = useTranslation();
  const currentUser = useCurrentUser();

  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const repliesFromOldest = useMemo(() => [...replies].reverse(), [replies]);

  return (
    <div
      data-testid="inline-comment-replies"
      className="inline-comment-replies"
    >
      {repliesFromOldest.map((reply) => (
        <InlineCommentReplyItem
          key={reply.id}
          reply={reply}
          rendererOptions={rendererOptions}
          updateReply={updateReply}
          removeReply={removeReply}
          isOwnReply={currentUser?._id === reply.creatorId}
        />
      ))}

      <div className="inline-comment-reply-form ms-4 ms-sm-5 mt-2">
        {isReplyOpen ? (
          <CommentEditor
            pageId={pageId}
            revisionId={revisionId}
            replyTo={parentId}
            onSubmit={(comment) => onSubmitReply(parentId, comment)}
            onCommented={() => setIsReplyOpen(false)}
            onCanceled={() => setIsReplyOpen(false)}
          />
        ) : (
          <button
            type="button"
            data-testid="inline-comment-reply-toggle-button"
            // No `ms-5` here (unlike PageComment.tsx's reply toggle): the
            // indent is already applied by the wrapping `.inline-comment-reply-form`,
            // so adding it again would double the indent.
            className="btn btn-secondary btn-comment-reply text-start w-100"
            onClick={() => setIsReplyOpen(true)}
          >
            <UserPicture user={currentUser} noLink noTooltip className="me-2" />
            <span className="material-symbols-outlined me-1 fs-5 pb-1">
              reply
            </span>
            <small>{t('page_comment.reply')}...</small>
          </button>
        )}
      </div>
    </div>
  );
};
