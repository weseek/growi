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
 */
import { type FC, type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';

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
};

export const InlineCommentItem: FC<InlineCommentItemProps> = (
  props,
): JSX.Element => {
  const { comment, rendererOptions, resolve, createReply } = props;
  const { t } = useTranslation();

  const [resolveError, setResolveError] = useState<string>();
  const isResolved = comment.resolvedAt != null;

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
            <blockquote
              className={`small text-body-secondary mb-2 ps-2 ${styles['inline-comment-quote']}`}
            >
              {comment.anchor.quote}
            </blockquote>
          </>
        }
        footer={
          resolveError != null ? (
            <span
              className="text-danger d-block"
              data-testid="inline-comment-resolve-error"
            >
              {resolveError}
            </span>
          ) : undefined
        }
      >
        {rendererOptions != null ? (
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
        replies={comment.replies}
        rendererOptions={rendererOptions}
        onSubmitReply={createReply}
      />
    </div>
  );
};
