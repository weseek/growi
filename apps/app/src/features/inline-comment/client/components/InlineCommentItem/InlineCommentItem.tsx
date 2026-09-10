/**
 * A single inline comment in the comment list (design.md:
 * `InlineCommentItem`（`InlineCommentList` から移動・構造を変更）).
 *
 * The box, the header row (author picture / name / posted date) and the body
 * container all come from the shared `CommentCard`, so an inline comment sits
 * in exactly the same box as a normal comment (requirement 13.3, 13.4). Only
 * the parts that genuinely differ are supplied through its slots:
 *
 * - `headerEnd`: the unresolved/resolved badge and the resolve toggle
 *   (requirement 13.7), right-aligned by this component's own `ms-auto`
 *   wrapper — `CommentCard` renders `headerEnd` unwrapped precisely because
 *   the normal comment needs a different margin there (`ms-2`).
 * - `beforeBody`: the type-label row that tells an inline comment apart from
 *   a normal one (requirement 13.10) followed by the anchored quote
 *   (requirement 13.6).
 *
 * The unresolved badge keeps `bg-warning text-dark`. Requirement 11 covers
 * the creation UI, not this badge, and switching it to `primary` would give
 * it the send button's color and make a status read like an action — see
 * design.md 「未解決の札の色は変えない」.
 *
 * `RevisionRenderer` receives `additionalClassName="comment"`, matching
 * `Comment.tsx`; without it the rendered markdown only gets the `wiki` class
 * and `Comment.module.scss`'s paragraph/blockquote spacing (scoped to
 * `.wiki.comment`) never reaches an inline comment.
 *
 * The replies subtree stays outside the box, below it, as a nested thread —
 * each reply gets its own box of its own.
 *
 * Edit/delete (requirements.md Requirement 18): shown only to the comment's
 * own creator (`comment.creatorId === currentUser?._id` -- `creator` is not
 * used for this check, see design.md's `InlineCommentItem` /
 * `InlineCommentReplies` section: `creator` is only ever populated by
 * `listByPageId()`, and checking `creatorId` keeps this component consistent
 * with the popover, which cannot rely on a populated `creator`), and gated by
 * the same `NotAvailableIfReadOnlyUserNotAllowedToComment` restriction
 * `CommentControl.tsx` applies to a normal comment. Editing swaps the body
 * slot for `MentionAwareCommentInput` (task 4's `initialValue`); canceling
 * reverts to the read-only body without calling `update`. Deleting opens a
 * small inline confirmation (not `DeleteCommentModal` -- design.md explains
 * why that component is not reused here) and only calls `remove` once
 * confirmed.
 */
import { type FC, type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NotAvailableIfReadOnlyUserNotAllowedToComment } from '~/client/components/NotAvailableForReadOnlyUser';
import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentWithReplies } from '../../../interfaces';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';
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
  /** Persists an edited origin-comment body (Requirement 18.1, 18.2). */
  update: (id: string, comment: string) => Promise<unknown>;
  /** Deletes the origin comment, along with its replies (Requirement 18.5, 18.6). */
  remove: (id: string) => Promise<unknown>;
  /** Persists an edited reply body (Requirement 18.1, 18.2), forwarded to `InlineCommentReplies`. */
  updateReply: (id: string, comment: string) => Promise<unknown>;
  /** Deletes a single reply (Requirement 18.5), forwarded to `InlineCommentReplies`. */
  removeReply: (id: string) => Promise<unknown>;
  /**
   * Scrolls the page body to the highlighted range this comment anchors to
   * (design.md 決定4 / requirement 3.1). Wired to the anchored quote below —
   * clicking the quote is the natural trigger since it is literally the text
   * being jumped to. The boolean re-anchor-failure result is handled entirely
   * inside `scrollToRange` itself (task 4.1); this component does not need to
   * interpret it.
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
  const [editError, setEditError] = useState<string>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const isResolved = comment.resolvedAt != null;
  const isOwnComment = currentUser?._id === comment.creatorId;

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

  const handleEditSubmit = async (text: string): Promise<void> => {
    try {
      await update(comment.id, text);
      setEditError(undefined);
      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when updating the comment',
      );
      // Rethrown so MentionAwareCommentInput's own submit handler treats
      // this as a failure too (keeps the edited text on screen instead of
      // clearing it as if the submit had succeeded).
      throw err;
    }
  };

  const handleEditCancel = (): void => {
    setIsEditing(false);
    setEditError(undefined);
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
        rootClassName={isResolved ? 'inline-comment-item-resolved' : undefined}
        headerEnd={
          <span className="ms-auto d-flex align-items-center gap-2">
            <span
              data-testid="inline-comment-status"
              className={`badge ${isResolved ? 'bg-secondary' : 'bg-warning text-dark'}`}
            >
              {isResolved
                ? t('inline_comment.resolved')
                : t('inline_comment.unresolved')}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
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
            <div className="small fw-bold text-body-secondary d-flex align-items-center gap-1 mb-1">
              <span className="material-symbols-outlined fs-6">chat</span>
              {t('inline_comment.label')}
            </div>
            {/* `inline-comment-quote` is `:global(.inline-comment-quote)` in
                the CSS module (see InlineCommentItem.module.scss), so it is
                referenced here as a plain class name — CSS Modules never adds
                a `:global()` selector to the `styles` lookup table, so
                `styles['inline-comment-quote']` would always be `undefined`. */}
            {/* A real `<button>` wraps the quote so the click target is
                keyboard-accessible by default (biome's a11y rules reject a
                `role="button"` div/blockquote in favor of a real button
                element) -- clicking or activating it (Enter/Space, native to
                `<button>`) jumps to the anchored range in the page body
                (requirement 3.1). Reset to plain-text styling so it still
                reads as the quote, not a button. */}
            <button
              type="button"
              className="btn p-0 border-0 bg-transparent text-start w-100"
              onClick={handleQuoteClick}
            >
              <blockquote className="inline-comment-quote small text-body-secondary mb-2 ps-2">
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
            {editError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-edit-error"
              >
                {editError}
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
            {isOwnComment && !isEditing && !isDeleteConfirmOpen && (
              <NotAvailableIfReadOnlyUserNotAllowedToComment>
                <div className="inline-comment-controls d-flex gap-2 mt-1">
                  <button
                    type="button"
                    data-testid="inline-comment-edit-button"
                    className="btn btn-sm btn-link p-0"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('Edit')}
                  </button>
                  <button
                    type="button"
                    data-testid="inline-comment-delete-button"
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
                data-testid="inline-comment-delete-confirm"
                className="d-flex align-items-center gap-2 mt-1"
              >
                <span>{t('page_comment.delete_comment')}</span>
                <button
                  type="button"
                  data-testid="inline-comment-delete-confirm-button"
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  {t('Delete')}
                </button>
                <button
                  type="button"
                  data-testid="inline-comment-delete-cancel-button"
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
              editorKey={`inline_comment_edit_${comment.id}`}
              initialValue={comment.comment}
              onSubmit={handleEditSubmit}
            />
            <button
              type="button"
              data-testid="inline-comment-edit-cancel-button"
              className="btn btn-sm btn-outline-secondary mt-1"
              onClick={handleEditCancel}
            >
              {t('Cancel')}
            </button>
          </div>
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
