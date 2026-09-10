/**
 * Nested reply display + a Reply.../Cancel-toggled reply-submission UI for
 * an inline comment thread.
 *
 * Visual nesting follows `ReplyComments.tsx`
 * (`~/client/components/PageComment/ReplyComments.tsx`): each reply sits in
 * an indented container (`ms-4 ms-sm-5`), the same classes that component
 * uses. `ReplyComments.tsx` itself is not reused here — it is wired to the
 * legacy page-end comment feature's own state (delete modal, inline edit
 * mode, `ICommentHasId` shape), none of which fits an inline-comment reply
 * — so this component follows its established visual pattern instead of
 * importing it. (Edit/delete for a reply is provided below, but through this
 * component's own state and `MentionAwareCommentInput`, not `ReplyComments.tsx`'s.)
 *
 * Reply bodies render through `RevisionRenderer` with the caller-supplied
 * `rendererOptions` — the SAME `RendererOptions` the rest of the comment
 * feature uses (built by `generateCommentViewOptions`, which injects the
 * real `services/renderer/remark-plugins/mention` plugin), so `@username`
 * in a reply gets the same mention-highlight markup as everywhere else
 * (requirement 3.1). This component does not compute that highlighting
 * itself.
 *
 * Each already-posted reply is wrapped in the shared `CommentCard` (the same
 * box `InlineCommentItem` uses for the origin comment), so a reply reads as
 * the same kind of comment box, not a lighter-weight variant (requirement
 * 13.3, 13.4). The `ms-4 ms-sm-5 mt-2` indentation stays on the wrapping
 * element regardless of whether it holds the toggle button or the open
 * editor, so the whole reply area (already-posted replies + the compose UI)
 * keeps one consistent left indent.
 *
 * The reply-composition UI is the literal same `CommentEditor` the normal
 * page-bottom comment thread uses for its own replies (not a separate,
 * inline-comment-specific input) — same CodeMirror editor, mention
 * completion, attachment upload, Slack notification toggle, and preview
 * tab. It differs from a normal comment reply only in where the text is
 * persisted: `CommentEditor`'s `onSubmit` override routes it through this
 * inline comment's own `createReply` (via `onSubmitReply`) instead of the
 * default `useSWRxPageComment` post path, since inline-comment replies are
 * created through a separate apiv3 route
 * (`POST /_api/v3/inline-comments/:id/replies`), not `/comments.add`.
 * `pageId`/`revisionId` are required by `CommentEditor`'s props but are
 * inert on this path — they are only read by the default post/update
 * logic that `onSubmit` bypasses.
 *
 * Closed state shows a toggle button with the SAME wording and appearance
 * as `PageComment.tsx`'s own reply toggle (avatar + "reply" icon +
 * `t('page_comment.reply')` plus a literal "..." + the same
 * `btn btn-secondary btn-comment-reply` classes) via `useCurrentUser()`
 * (Requirement 4.1), following the same `showEditorIds`-style open/closed
 * pattern `PageComment.tsx` uses for its own reply editors — but since a
 * single origin comment has exactly one reply thread (1:1, not a set of
 * many), a plain `boolean` is enough here.
 *
 * `replies` arrives in `InlineCommentService.listByPageId()`'s raw
 * `createdAt: 'desc'` fetch order (newest first) — that API is a plain
 * creation-order fetch and does not decide display order, the same as the
 * page-footer comment API. This component reverses it to oldest-first
 * before rendering, mirroring `PageComment.tsx`'s own `commentsFromOldest`
 * reversal, so a reply thread always reads oldest-to-newest regardless of
 * whether the origin comment is inline or normal.
 *
 * Edit/delete (requirements.md Requirement 18.1, 18.2, 18.5): each already-posted reply
 * gets its own edit/delete controls, shown only to that reply's own creator
 * (`reply.creatorId === currentUser?._id`, not the populated `creator` --
 * same rationale as `InlineCommentItem`) and gated by
 * `NotAvailableIfReadOnlyUserNotAllowedToComment`. `InlineCommentReplyItem`
 * below holds this per-reply local state (`isEditing`/`isDeleteConfirmOpen`/
 * `editError`/`deleteError`) so editing one reply does not affect its
 * siblings.
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

type InlineCommentRepliesProps = {
  parentId: string;
  pageId: string;
  /**
   * Passed through to `CommentEditor`'s required `revisionId` prop, but
   * never actually read on this path — `onSubmit` bypasses the default
   * post/update logic that would otherwise consume it.
   */
  revisionId: string;
  replies: InlineCommentReply[];
  /**
   * Undefined while the caller's renderer options are still loading — in
   * that case reply bodies fall back to plain text rather than blocking
   * the whole list on the renderer-options fetch.
   */
  rendererOptions: RendererOptions | undefined;
  onSubmitReply: (parentId: string, comment: string) => Promise<unknown>;
  /** Persists an edited reply body (Requirement 18.1, 18.2). */
  updateReply: (id: string, comment: string) => Promise<unknown>;
  /** Deletes a single reply (Requirement 18.5). */
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
      // Rethrown so MentionAwareCommentInput keeps the edited text on screen
      // instead of clearing it as if the submit had succeeded.
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
            {isOwnReply && !isEditing && !isDeleteConfirmOpen && (
              <NotAvailableIfReadOnlyUserNotAllowedToComment>
                <div className="inline-comment-controls d-flex gap-2 mt-1">
                  <button
                    type="button"
                    data-testid="inline-comment-reply-edit-button"
                    className="btn btn-sm btn-link p-0"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('Edit')}
                  </button>
                  <button
                    type="button"
                    data-testid="inline-comment-reply-delete-button"
                    className="btn btn-sm btn-link p-0 text-danger"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    {t('Delete')}
                  </button>
                </div>
              </NotAvailableIfReadOnlyUserNotAllowedToComment>
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
            // `w-100` (no `ms-5`, unlike PageComment.tsx's reply-toggle
            // button): PageComment.tsx's button lives inside a
            // `flex-row-reverse` wrapper with no margin of its own, where
            // `ms-5` does the work of pushing the button to the correct
            // side. Here the indentation is already applied by the
            // surrounding `.inline-comment-reply-form` wrapper's
            // `ms-4 ms-sm-5`, so repeating `ms-5` on the button itself would
            // double the indent -- dropped to avoid that collision while
            // keeping every other visual class identical (Requirement 4.1).
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
