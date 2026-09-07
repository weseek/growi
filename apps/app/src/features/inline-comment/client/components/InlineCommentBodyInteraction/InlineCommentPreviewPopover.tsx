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
 * The reply input is deliberately a plain `<textarea>` + submit button, not
 * the mention-aware editor the bottom-of-page comment list uses (design.md
 * Non-Goals: "本文中ポップオーバーの返信UIを...同じにすること"). It has no
 * editing UI for the origin comment's own body at all (Req 2.5).
 */
import { type FC, type JSX, useEffect, useMemo, useRef, useState } from 'react';
import type { VirtualElement } from '@popperjs/core';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';

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
  onClose: () => void;
};

export const InlineCommentPreviewPopover: FC<
  InlineCommentPreviewPopoverProps
> = (props): JSX.Element | null => {
  const { comment, range, rendererOptions, createReply, onClose } = props;
  const { t } = useTranslation();

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
    <div
      ref={setPopperElement}
      data-testid="inline-comment-preview-popover"
      style={{ zIndex: 1070 }}
      className="card shadow-sm"
    >
      <div className="card-body position-relative">
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-2"
          aria-label={t('Close')}
          onClick={onClose}
        />

        <CommentCard creator={comment.creator} createdAt={comment.createdAt}>
          {rendererOptions != null ? (
            <RevisionRenderer
              rendererOptions={rendererOptions}
              markdown={comment.comment}
            />
          ) : (
            <span>{comment.comment}</span>
          )}
        </CommentCard>

        {comment.replies.length > 0 && (
          <div data-testid="inline-comment-preview-popover-replies">
            {comment.replies.map((reply) => (
              <div
                key={reply.id}
                data-testid="inline-comment-preview-popover-reply"
                className="ms-4 ms-sm-5 mt-2"
              >
                <CommentCard
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
        )}

        <div className="inline-comment-preview-popover-reply-form mt-2">
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
          <button
            type="button"
            className="btn btn-sm btn-primary mt-1"
            disabled={draftComment.trim().length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {t('page_comment.comment')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
