/**
 * A single inline comment in the comment list. The box, header row, and body
 * container all come from the shared `CommentCard`, so an inline comment
 * sits in exactly the same box as a normal comment; only the parts that
 * genuinely differ are supplied through its slots (the resolved badge/toggle
 * via `headerEnd`, the type label + anchored quote via `beforeBody`).
 *
 * `RevisionRenderer` receives `additionalClassName="comment"`, matching
 * `Comment.tsx`; without it, `Comment.module.scss`'s paragraph/blockquote
 * spacing (scoped to `.wiki.comment`) never reaches an inline comment.
 *
 * Edit/delete: shown only to the comment's own creator (`comment.creatorId
 * === currentUser?._id` — `creator` is not used for this check since it's
 * only ever populated by `listByPageId()`, and the popover cannot rely on a
 * populated `creator` either). Gated by the same
 * `NotAvailableIfReadOnlyUserNotAllowedToComment` restriction
 * `CommentControl.tsx` applies to a normal comment. Deleting opens the
 * `DeleteConfirmAlert` shown in place, the same confirmation a normal
 * comment uses.
 */
import { type FC, type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NotAvailableIfReadOnlyUserNotAllowedToComment } from '~/client/components/NotAvailableForReadOnlyUser';
import { CommentCard } from '~/client/components/PageComment/CommentCard';
import { CommentEditor } from '~/client/components/PageComment/CommentEditor';
import { DeleteConfirmAlert } from '~/client/components/PageComment/DeleteConfirmAlert';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentWithReplies } from '../../../interfaces';
import { InlineCommentReplies } from './InlineCommentReplies';

import styles from './InlineCommentItem.module.scss';

type InlineCommentItemProps = {
  comment: InlineCommentWithReplies;
  /**
   * Undefined while the caller's renderer options are still loading — the
   * body then falls back to plain text rather than blocking the whole list
   * on the renderer-options fetch.
   */
  rendererOptions: RendererOptions | undefined;
  resolve: (id: string, resolved: boolean) => Promise<unknown>;
  createReply: (parentId: string, comment: string) => Promise<unknown>;
  /** Persists an edited origin-comment body. */
  update: (id: string, comment: string) => Promise<unknown>;
  /** Deletes the origin comment, along with its replies. */
  remove: (id: string) => Promise<unknown>;
  /** Persists an edited reply body, forwarded to `InlineCommentReplies`. */
  updateReply: (id: string, comment: string) => Promise<unknown>;
  /** Deletes a single reply, forwarded to `InlineCommentReplies`. */
  removeReply: (id: string) => Promise<unknown>;
  /**
   * Scrolls the page body to the highlighted range this comment anchors to.
   * Wired to the anchored quote below; the boolean re-anchor-failure result
   * is handled entirely inside `scrollToRange` itself.
   */
  scrollToRange: (commentId: string) => boolean;
};

export const InlineCommentItem: FC<InlineCommentItemProps> = (
  props,
): JSX.Element => {
  const {
    comment,
    rendererOptions,
    resolve,
    createReply,
    update,
    remove,
    updateReply,
    removeReply,
    scrollToRange,
  } = props;
  const { t } = useTranslation();
  const currentUser = useCurrentUser();

  const [resolveError, setResolveError] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const isResolved = comment.resolvedAt != null;
  const isOwnComment = currentUser?._id === comment.creatorId;

  // `opacity-75` is what makes a resolved comment recede, mirroring the
  // mockup's `.ic-item[data-resolved="true"] { opacity: .8 }`. Besides the
  // badge's wording/color and the toggle's wording, that fade is the only
  // thing the resolved state changes — the layout stays identical.
  const resolvedRootClassName = isResolved
    ? 'inline-comment-item-resolved opacity-75'
    : undefined;

  const handleResolveToggle = async (): Promise<void> => {
    try {
      await resolve(comment.id, !isResolved);
      setResolveError(undefined);
    } catch (err) {
      setResolveError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when updating the resolved status',
      );
    }
  };

  const handleQuoteClick = (): void => {
    scrollToRange(comment.id);
  };

  const handleEditCancel = (): void => {
    setIsEditing(false);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await remove(comment.id);
      setDeleteError(undefined);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when deleting the comment',
      );
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div
      data-testid="inline-comment-item"
      data-resolved={isResolved}
      className={`inline-comment-item mb-3 ${styles['inline-comment-item-styles']}`}
    >
      <CommentCard
        id={comment.id}
        creator={comment.creator}
        createdAt={comment.createdAt}
        rootClassName={resolvedRootClassName}
        headerEnd={
          <span className="ms-auto d-flex align-items-center gap-2">
            {isOwnComment && !isEditing && !isDeleteConfirmOpen && (
              <NotAvailableIfReadOnlyUserNotAllowedToComment>
                <span
                  className={`d-flex align-items-center gap-1 ${styles['icon-button-container']}`}
                >
                  <button
                    type="button"
                    data-testid="inline-comment-edit-button"
                    className={`btn btn-link ${styles['icon-button']}`}
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    type="button"
                    data-testid="inline-comment-delete-button"
                    className={`btn btn-link text-danger ${styles['icon-button']}`}
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </span>
              </NotAvailableIfReadOnlyUserNotAllowedToComment>
            )}
            <span
              data-testid="inline-comment-status"
              className={`badge rounded-pill ${styles['inline-comment-status-badge']} ${
                isResolved
                  ? 'bg-success-subtle text-success-emphasis'
                  : 'bg-warning-subtle text-warning-emphasis'
              }`}
            >
              {isResolved
                ? t('inline_comment.resolved')
                : t('inline_comment.unresolved')}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={handleResolveToggle}
            >
              {isResolved
                ? t('inline_comment.reopen')
                : t('inline_comment.resolve')}
            </button>
          </span>
        }
        beforeBody={
          <>
            {/* `inline-comment-quote` is `:global(...)` in the CSS module, so it's
                referenced as a plain class name -- styles['inline-comment-quote']
                would be undefined. A real <button> (not a div with role="button")
                wraps the quote for default keyboard accessibility, reset to
                plain-text styling so it still reads as the quote. */}
            <button
              type="button"
              className="btn p-0 border-0 bg-transparent text-start w-100"
              onClick={handleQuoteClick}
            >
              <blockquote className="inline-comment-quote bg-body-tertiary rounded-end small text-body-secondary my-2 p-2">
                {comment.anchor.quote}
              </blockquote>
            </button>
          </>
        }
        footer={
          <>
            {resolveError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-resolve-error"
              >
                {resolveError}
              </span>
            )}
            {deleteError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-delete-error"
              >
                {deleteError}
              </span>
            )}
            {isDeleteConfirmOpen && (
              <DeleteConfirmAlert
                testIdPrefix="inline-comment"
                onCancel={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
              />
            )}
          </>
        }
      >
        {isEditing ? (
          // 2026-09-11: uses the literal same `CommentEditor` the normal
          // comment's own re-edit uses (`Comment.tsx`), matching the user's
          // request to unify the two editing experiences -- toolbar,
          // attachments, preview tab and all. `onSubmit` overrides
          // `CommentEditor`'s default post/update path to route through this
          // comment's own `update`, the same override technique
          // `InlineCommentReplies.tsx`'s reply composer already uses for
          // `createReply`.
          <CommentEditor
            pageId={comment.pageId}
            currentCommentId={comment.id}
            commentBody={comment.comment}
            revisionId={comment.anchorOriginRevisionId}
            onCanceled={handleEditCancel}
            onCommented={() => setIsEditing(false)}
            onSubmit={(text) => update(comment.id, text)}
          />
        ) : rendererOptions != null ? (
          <RevisionRenderer
            rendererOptions={rendererOptions}
            markdown={comment.comment}
            additionalClassName="comment"
          />
        ) : (
          <span>{comment.comment}</span>
        )}
      </CommentCard>

      <InlineCommentReplies
        parentId={comment.id}
        pageId={comment.pageId}
        revisionId={comment.anchorOriginRevisionId}
        replies={comment.replies}
        rendererOptions={rendererOptions}
        onSubmitReply={createReply}
        updateReply={updateReply}
        removeReply={removeReply}
      />
    </div>
  );
};
