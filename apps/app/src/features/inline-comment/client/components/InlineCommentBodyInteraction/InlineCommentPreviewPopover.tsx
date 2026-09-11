/**
 * Content-preview + simple-reply popover shown when a saved inline-comment
 * highlight in the page body is hovered/clicked/tapped.
 *
 * Positioning follows the same building blocks `SelectionPopover` uses, but
 * `SelectionPopover` itself isn't reused as a wrapper: it has no
 * outside-click-to-close behavior, which this popover needs.
 *
 * The reply input is a plain `<textarea>`, not the mention-aware editor the
 * bottom-of-page comment list uses — only the surrounding composer layout
 * borrows that visual language.
 *
 * The origin comment's header and body are this popover's own markup, not the
 * shared `CommentCard`: the mockup draws the origin comment flat on the
 * popover's surface, while `CommentCard` brings the shared comment box (a
 * gray fill, a speech-bubble triangle, its own small avatar). The replies
 * below still use `CommentCard` — a reply *is* a small boxed comment in the
 * mockup too. See design.md「Popover 再設計」.
 *
 * Editing the origin comment is shown only to its own creator, gated by the
 * same read-only-user restriction `InlineCommentItem.tsx` applies. There is
 * no delete action here (list-only), and this popover never shows a reply,
 * so there's no reply-edit counterpart either.
 */
import { type FC, type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { UserPicture } from '@growi/ui/dist/components';
import type { VirtualElement } from '@popperjs/core';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import FormattedDistanceDate from '~/client/components/FormattedDistanceDate';
import { NotAvailableIfReadOnlyUserNotAllowedToComment } from '~/client/components/NotAvailableForReadOnlyUser';
import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import { Username } from '~/components/User/Username';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentWithReplies } from '../../../interfaces';
import { MentionPickerButton } from '../InlineCommentForm/MentionPickerButton';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';
import { useCommentInputControls } from '../MentionAwareCommentInput/use-comment-input-controls';
import { rangeToVirtualElement } from '../SelectionPopover/selection-virtual-element';
import { usePopperPosition } from '../SelectionPopover/use-popper-position';

import styles from './InlineCommentPreviewPopover.module.scss';

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
  /** Toggles the origin comment's resolved state. */
  resolve: (id: string, resolved: boolean) => Promise<unknown>;
  /** Persists an edited origin-comment body; same author-only/read-only-user gating as `InlineCommentItem.tsx`. */
  update: (id: string, comment: string) => Promise<unknown>;
  onClose: () => void;
  /** Fired once the pointer has actually arrived on the popover; the caller promotes a hover-shown popover into its pinned state on this signal. */
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
    update,
    onClose,
    onPointerEnter,
  } = props;
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const isOwnComment = currentUser?._id === comment.creatorId;

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

  // A click/mousedown outside the popover closes it -- SelectionPopover has
  // no such behavior, so it's implemented directly here.
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

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string>();

  const { canSubmit, submit, insertMention, onControlsChange } =
    useCommentInputControls();

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
      // Rethrown so MentionAwareCommentInput keeps the edited text on screen instead of clearing it.
      throw err;
    }
  };

  const handleEditCancel = (): void => {
    setIsEditing(false);
    setEditError(undefined);
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
    // zIndex 1070 mirrors SelectionPopover's own portal (Bootstrap's $zindex-popover).
    // biome-ignore lint/a11y/noStaticElementInteractions: not an interactive element -- onMouseEnter only reports "pointer arrived" so the caller can lock the popover open
    <div
      ref={setPopperElement}
      data-testid="inline-comment-preview-popover"
      style={{ zIndex: 1070 }}
      // `card` gives the mockup's own surface color and 1px border; the
      // corner radius and the diffuse drop shadow are its `--radius-lg`
      // (14px -> Bootstrap's 1rem `rounded-4`, the nearest step) and
      // `--shadow`, taken from Bootstrap's own scale rather than written as
      // hex/bespoke values (Requirement 3.1). The card treatment lives here,
      // on the popover itself, because the mockup puts the origin comment
      // flat on this surface instead of in a box of its own.
      className={`card rounded-4 shadow ${styles['inline-comment-preview-popover-styles']}`}
      onMouseEnter={onPointerEnter}
    >
      <div className="card-body">
        <div data-testid="inline-comment-preview-popover-origin">
          {/* The origin comment's own header row: avatar, author, posted
              date, then the controls pushed to the right edge. Built here
              rather than taken from `CommentCard` so the row can carry the
              mockup's own sizes (a 30px avatar) on the popover's own
              surface. */}
          <div
            data-testid="inline-comment-preview-popover-header"
            className="d-flex align-items-center gap-2"
          >
            <span
              className={
                styles['inline-comment-preview-popover-author-picture']
              }
            >
              <UserPicture user={comment.creator} />
            </span>
            <span className="small fw-semibold">
              {/* `Username`'s prop type excludes null but treats
                  null/undefined/unpopulated alike at runtime, so the same
                  normalization `CommentCard` does applies here. */}
              <Username user={comment.creator ?? undefined} />
            </span>
            <span className="small text-body-secondary">
              {/* Plain muted text, not `CommentCard`'s anchor link to
                  `#{id}`: an inline comment has no element with that id to
                  jump to, and the mockup draws the timestamp as text. */}
              <FormattedDistanceDate id={comment.id} date={comment.createdAt} />
            </span>
            <span className="ms-auto d-flex align-items-center gap-2">
              {isOwnComment && !isEditing && (
                <NotAvailableIfReadOnlyUserNotAllowedToComment>
                  {/* The same icon-button pattern the list item uses for its
                      own edit action (`CommentControl.tsx`'s glyph + button
                      classes, Requirement 3.5), but always visible rather
                      than hover-revealed: a popover is on screen only
                      briefly, so a control that needs to be discovered by
                      hovering would be easy to miss. */}
                  <button
                    type="button"
                    data-testid="inline-comment-preview-popover-edit-button"
                    className={`btn btn-link opacity-50 rounded-circle ${styles['inline-comment-preview-popover-icon-button']}`}
                    aria-label={t('Edit')}
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </NotAvailableIfReadOnlyUserNotAllowedToComment>
              )}
              {/* No status badge here (design.md「Popover 再設計」): the
                  toggle's own label already says which way the state will
                  go, and the badge repeated that in the popover's tight
                  header row. The list item keeps its badge. */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={handleResolveToggle}
              >
                {isResolved
                  ? t('inline_comment.reopen')
                  : t('inline_comment.resolve')}
              </button>
              {/* Last element of the header row, after the resolve toggle.
                  It used to be `position-absolute top-0 end-0` on the card
                  body, which put it above the header row in the card's own
                  top padding, where it visually collided with the popover's
                  rounded corner. */}
              <button
                type="button"
                data-testid="inline-comment-preview-popover-close-button"
                className="btn-close"
                aria-label={t('Close')}
                onClick={onClose}
              />
            </span>
          </div>

          {/* Same left-accent idiom as InlineCommentItem.tsx's quote, but not a click target. */}
          <blockquote
            data-testid="inline-comment-preview-popover-quote"
            className={`inline-comment-quote bg-body-tertiary rounded-end small text-body-secondary mt-3 mb-2 p-2 ${styles['inline-comment-preview-popover-quote-clamp']}`}
          >
            {comment.anchor.quote}
          </blockquote>

          {isEditing ? (
            // Accent-colored border marks the edit-mode input, echoing the
            // primary-accent color already used by the submit/send buttons
            // in this popover (Requirement 2.2, 3.1: semantic Bootstrap
            // utility classes only, no hardcoded hex).
            <div
              data-testid="inline-comment-preview-popover-edit-form"
              className="border border-primary rounded p-2"
            >
              <MentionAwareCommentInput
                editorKey={`inline_comment_preview_popover_edit_${comment.id}`}
                initialValue={comment.comment}
                onSubmit={handleEditSubmit}
                onControlsChange={onControlsChange}
              />
              {/* Cancel and Save below the input, right-aligned, in the
                  order the delete confirmation elsewhere already uses
                  (Requirement 2.2). Save is rendered here, not by
                  MentionAwareCommentInput: that component reports its
                  submit control outward so each caller places it, which is
                  what lets it sit beside Cancel. Same composition as the
                  list item's edit mode. */}
              <div className="d-flex align-items-center justify-content-end gap-2 mt-1">
                <span className="me-auto">
                  <MentionPickerButton onInsert={insertMention} />
                </span>
                <button
                  type="button"
                  data-testid="inline-comment-preview-popover-edit-cancel-button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleEditCancel}
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  data-testid="inline-comment-preview-popover-edit-save-button"
                  className="btn btn-sm btn-primary"
                  disabled={!canSubmit}
                  onClick={submit}
                >
                  {t('Update')}
                </button>
              </div>
            </div>
          ) : (
            // A named wrapper, where `CommentCard` used to supply
            // `.page-comment-body`: the replies below still carry that class,
            // so the origin body needs an identity of its own for tests and
            // for the mockup cross-check's measurements to tell the two
            // apart.
            <div data-testid="inline-comment-preview-popover-body">
              {rendererOptions != null ? (
                <RevisionRenderer
                  rendererOptions={rendererOptions}
                  markdown={comment.comment}
                />
              ) : (
                <span>{comment.comment}</span>
              )}
            </div>
          )}

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
              data-testid="inline-comment-preview-popover-edit-error"
            >
              {editError}
            </span>
          )}
        </div>

        {/* Edit mode replaces everything below the quote -- the body, the
            reply thread and the reply form alike -- so the editor is the
            only thing competing for attention while a comment is being
            rewritten (Requirement 2.2's edit-mode artboard shows the header,
            the quote, the editor and its buttons, and nothing else). One
            guard around the whole group, rather than one per sibling, so a
            later addition here cannot be forgotten. */}
        {!isEditing && (
          <>
            {comment.replies.length > 0 && (
              <div data-testid="inline-comment-preview-popover-replies">
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    data-testid="inline-comment-preview-popover-reply"
                    className="mt-2"
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
            )}

            <div className="inline-comment-preview-popover-reply-form d-flex align-items-center gap-2">
              <UserPicture user={currentUser} noLink noTooltip />
              {/* flex-basis 0% avoids collapsing under the avatar/send button -- see InlineCommentForm.tsx. */}
              <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                {/* `rows={1}`: the pill radius only reads as a one-line reply
                  field at one row's height -- at the textarea's default two
                  rows the same radius renders as a tall stadium-shaped box
                  instead. */}
                <textarea
                  className="form-control rounded-pill"
                  rows={1}
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
                className={`btn btn-primary btn-sm p-0 rounded-circle d-inline-flex align-items-center justify-content-center ${styles['inline-comment-preview-popover-send-button']}`}
                disabled={draftComment.trim().length === 0 || isSubmitting}
                onClick={handleSubmit}
                aria-label={t('page_comment.comment')}
              >
                <span
                  className="material-symbols-outlined fs-6"
                  aria-hidden="true"
                >
                  send
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};
