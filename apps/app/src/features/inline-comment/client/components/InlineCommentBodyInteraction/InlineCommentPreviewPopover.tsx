/**
 * Content-preview + simple-reply popover shown when a saved inline-comment
 * highlight in the page body is hovered/clicked/tapped (design.md 決定2,
 * requirements.md Requirement 2).
 *
 * Positioning follows exactly the same building blocks `SelectionPopover`
 * uses (`rangeToVirtualElement` + `usePopperPosition`, portaled into
 * `document.body`, z-index 1070, last-valid-rect fallback for a zero rect) --
 * `SelectionPopover` itself is not reused as a wrapper here because it has no
 * outside-click-to-close behavior, which this popover requires (Req 2.4).
 *
 * The reply input is deliberately a plain `<textarea>`, not the mention-aware
 * editor the bottom-of-page comment list uses (design.md Non-Goals:
 * "本文中ポップオーバーの返信UIを...同じにすること") -- only its surrounding
 * layout (avatar + row + icon send button) borrows InlineCommentForm.tsx's/
 * MentionAwareCommentInput.tsx's established composer visual language
 * (requirements.md Requirement 3.5). It has no editing UI for the origin
 * comment's own body at all (Req 2.5).
 */
import { type FC, type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { UserPicture } from '@growi/ui/dist/components';
import type { VirtualElement } from '@popperjs/core';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentWithReplies } from '../../../interfaces';
import { rangeToVirtualElement } from '../SelectionPopover/selection-virtual-element';
import { usePopperPosition } from '../SelectionPopover/use-popper-position';

type ReferenceRect = ReturnType<VirtualElement['getBoundingClientRect']>;

const isZeroRect = (rect: ReferenceRect): boolean =>
  rect.width === 0 && rect.height === 0;

type InlineCommentPreviewPopoverProps = {
  /** The origin comment (with its nested replies) to display. */
  comment: InlineCommentWithReplies;
  /** The range the popover is positioned against (the resolved highlight). */
  range: Range;
  /**
   * Undefined while the caller's renderer options are still loading -- the
   * body then falls back to plain text rather than blocking on the fetch.
   */
  rendererOptions: RendererOptions | undefined;
  createReply: (parentId: string, comment: string) => Promise<unknown>;
  /**
   * Toggles the origin comment's resolved state. Used exactly as
   * `InlineCommentItem.tsx` uses its own `resolve` prop (design.md's
   * `InlineCommentPreviewPopover` block; research.md's "Duplicate the
   * resolve badge/button markup" decision -- not extracted into a shared
   * component with that file).
   */
  resolve: (id: string, resolved: boolean) => Promise<unknown>;
  onClose: () => void;
  /**
   * Fired from the root portaled div's native `onMouseEnter` once the
   * pointer has actually arrived on the popover -- the only real caller
   * (`InlineCommentBodyInteraction`) promotes a hover-shown popover into its
   * pinned state on this signal (design.md's "Hover show/hide/lock
   * sequence", requirements.md 1.3/1.4).
   */
  onPointerEnter: () => void;
};

export const InlineCommentPreviewPopover: FC<
  InlineCommentPreviewPopoverProps
> = (props): JSX.Element | null => {
  const {
    comment,
    range,
    rendererOptions,
    createReply,
    resolve,
    onClose,
    onPointerEnter,
  } = props;
  const { t } = useTranslation();
  const currentUser = useCurrentUser();

  // A state-backed callback ref (not useRef): `usePopperPosition` takes the
  // popper element as an effect dependency, and the same node also serves as
  // the outside-click boundary below.
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );

  const lastValidRectRef = useRef<ReferenceRect | null>(null);

  const virtualElement = useMemo<VirtualElement>(() => {
    const rangeElement = rangeToVirtualElement(range);

    return {
      getBoundingClientRect: () => {
        const rect = rangeElement.getBoundingClientRect();

        if (isZeroRect(rect)) {
          return lastValidRectRef.current ?? rect;
        }

        lastValidRectRef.current = rect;
        return rect;
      },
    };
  }, [range]);

  usePopperPosition(virtualElement, popperElement);

  // Requirement 2.4: a click/mousedown outside the popover closes it. This is
  // new behavior `SelectionPopover` does not provide, so it is implemented
  // here directly (same idiom as MentionCandidateList.tsx's pointer
  // dismissal: a `mousedown` listener on `document` that checks whether the
  // event target is inside the popover's own DOM node).
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      if (
        popperElement != null &&
        target != null &&
        popperElement.contains(target)
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [popperElement, onClose]);

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

  const [draftComment, setDraftComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleSubmit = async (): Promise<void> => {
    const trimmed = draftComment.trim();
    if (trimmed.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createReply(comment.id, trimmed);
      setDraftComment('');
      setSubmitError(undefined);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred when posting the reply',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    // zIndex 1070 mirrors SelectionPopover's own portal (Bootstrap's
    // `$zindex-popover`) for the same stacking-context escape reason.
    // biome-ignore lint/a11y/noStaticElementInteractions: not an interactive element -- onMouseEnter only reports "pointer arrived" to the caller so it can lock the popover open (design.md's hover show/hide/lock sequence)
    <div
      ref={setPopperElement}
      data-testid="inline-comment-preview-popover"
      style={{ zIndex: 1070 }}
      className="card shadow-sm"
      onMouseEnter={onPointerEnter}
    >
      <div className="card-body position-relative">
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-2"
          aria-label={t('Close')}
          onClick={onClose}
        />

        <CommentCard
          id={comment.id}
          creator={comment.creator}
          createdAt={comment.createdAt}
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
            // Requirement 3.3: the saved anchor quote, visually distinguished
            // from the comment body via a left-accent border and a muted
            // background (same left-accent idiom as InlineCommentItem.tsx's
            // own quote, but this one is not a click target -- the popover
            // has no page-body scroll-to-range affordance).
            <blockquote
              data-testid="inline-comment-preview-popover-quote"
              className="inline-comment-preview-popover-quote small text-body-secondary bg-body-tertiary border-start border-3 rounded-1 ps-2 py-1 mb-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {comment.anchor.quote}
            </blockquote>
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
            />
          ) : (
            <span>{comment.comment}</span>
          )}
        </CommentCard>

        <hr className="my-2" />

        {comment.replies.length > 0 && (
          <>
            <div data-testid="inline-comment-preview-popover-replies">
              {comment.replies.map((reply) => (
                <div
                  key={reply.id}
                  data-testid="inline-comment-preview-popover-reply"
                  className="ms-4 ms-sm-5 mt-2"
                >
                  <CommentCard
                    id={reply.id}
                    creator={reply.creatorId}
                    createdAt={reply.createdAt}
                  >
                    {rendererOptions != null ? (
                      <RevisionRenderer
                        rendererOptions={rendererOptions}
                        markdown={reply.comment}
                      />
                    ) : (
                      <span>{reply.comment}</span>
                    )}
                  </CommentCard>
                </div>
              ))}
            </div>

            <hr className="my-2" />
          </>
        )}

        {/* Requirement 3.5/3.6: avatar + input row + icon send button,
            matching InlineCommentForm.tsx's/MentionAwareCommentInput.tsx's
            established composer visual language. The underlying
            handleSubmit/createReply call above is unchanged -- only this
            surrounding layout is new. */}
        <div className="inline-comment-preview-popover-reply-form d-flex align-items-start gap-2">
          <UserPicture user={currentUser} noLink noTooltip />
          {/* `flex: 1 1 0%` + `minWidth: 0`, not `flex-grow-1`/`w-100`: see
              InlineCommentForm.tsx's own comment on this same pattern -- an
              `auto` flex-basis here would collapse the input under the
              avatar and send button instead of sharing the row with them. */}
          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <textarea
              className="form-control"
              placeholder={t('inline_comment.reply_placeholder')}
              aria-label={t('inline_comment.reply_placeholder')}
              value={draftComment}
              disabled={isSubmitting}
              onChange={(e) => setDraftComment(e.target.value)}
            />
            {submitError != null && (
              <span
                className="text-danger d-block"
                data-testid="inline-comment-preview-popover-reply-error"
              >
                {submitError}
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{ width: '2rem', height: '2rem' }}
            disabled={draftComment.trim().length === 0 || isSubmitting}
            onClick={handleSubmit}
            aria-label={t('page_comment.comment')}
          >
            <span className="material-symbols-outlined fs-6" aria-hidden="true">
              send
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
