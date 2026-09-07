/**
 * Nested reply display + a Reply.../Cancel-toggled reply-submission UI for
 * an inline comment thread (design.md: File Structure Plan >
 * `InlineCommentList/InlineCommentReplies.tsx`, "返信のネスト表示。
 * ReplyComments.tsxの表示パターンを踏襲。既存コンポーネントは変更しない";
 * 決定5: "`InlineCommentReplies.tsx`は、通常コメントの`showEditorIds`パターンを
 * 踏襲したローカルな開閉状態（1スレッドにつき返信欄は1つなので`boolean`で
 * 足りる）を持ち、閉時は「Reply...」ボタン（既存キー`t('page_comment.reply')`
 * を流用）、開時は`MentionAwareCommentInput`＋Cancelボタンを描画する。現状の
 * 素の`<textarea>`ベースの返信欄は削除する").
 *
 * Visual nesting follows `ReplyComments.tsx`
 * (`~/client/components/PageComment/ReplyComments.tsx`): each reply sits in
 * an indented container (`ms-4 ms-sm-5`), the same classes that component
 * uses. `ReplyComments.tsx` itself is not reused here — it is wired to the
 * legacy page-end comment feature's own state (delete modal, inline edit
 * mode, `ICommentHasId` shape), none of which fits an inline-comment reply
 * (no edit/delete per this spec's Non-Goals) — so this component follows
 * its established visual pattern instead of importing it, per the task
 * boundary ("既存コンポーネントは変更しない").
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
 * element around that box (design.md: `InlineCommentReplies` は
 * `ms-4 ms-sm-5 mt-2` の字下げをそのまま残しつつ、各返信を `CommentCard`
 * で包む).
 *
 * The reply-composition input itself is the shared `MentionAwareCommentInput`
 * (task 5.1), extracted from `InlineCommentForm.tsx`, following the same
 * `showEditorIds`-style open/closed pattern `PageComment.tsx` uses for its
 * own reply editors — but since a single origin comment has exactly one
 * reply thread (1:1, not a set of many), a plain `boolean` is enough here
 * (design.md 決定5). Closed state shows a toggle button with the SAME
 * wording and appearance as `PageComment.tsx`'s own reply toggle (avatar +
 * "reply" icon + `t('page_comment.reply')` plus a literal "..." + the same
 * `btn btn-secondary btn-comment-reply` classes) via `useCurrentUser()`
 * (Requirement 4.1); open state renders
 * `MentionAwareCommentInput`, which owns its own text/error state, its own
 * Cancel button, and its own submit button — this component only wires
 * `onSubmit` to the unchanged `onSubmitReply` prop and closes the toggle on
 * `onSubmitted`/`onCancel` (Requirements 4.2, 4.3, 4.5).
 */

import { type FC, type JSX, useMemo, useState } from 'react';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'react-i18next';

import { CommentCard } from '~/client/components/PageComment/CommentCard';
import RevisionRenderer from '~/components/PageView/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import { useCurrentUser } from '~/states/global';

import type { InlineCommentReply } from '../../../interfaces';
import { MentionAwareCommentInput } from '../MentionAwareCommentInput/MentionAwareCommentInput';

type InlineCommentRepliesProps = {
  parentId: string;
  replies: InlineCommentReply[];
  /**
   * Undefined while the caller's renderer options are still loading — in
   * that case reply bodies fall back to plain text rather than blocking
   * the whole list on the renderer-options fetch.
   */
  rendererOptions: RendererOptions | undefined;
  onSubmitReply: (parentId: string, comment: string) => Promise<unknown>;
};

export const InlineCommentReplies: FC<InlineCommentRepliesProps> = (
  props,
): JSX.Element => {
  const { parentId, replies, rendererOptions, onSubmitReply } = props;
  const { t } = useTranslation();
  const currentUser = useCurrentUser();

  const [isReplyOpen, setIsReplyOpen] = useState(false);

  // One reply-input editor instance per origin comment's reply thread,
  // mirroring InlineCommentForm's `inline_comment_new_${pageId}` convention
  // (task 5.1) but scoped to `parentId` since each origin comment has its
  // own reply thread rather than one shared "new comment" editor per page.
  const editorKey = useMemo(
    () => `inline_comment_reply_${parentId}`,
    [parentId],
  );

  return (
    <div
      data-testid="inline-comment-replies"
      className="inline-comment-replies"
    >
      {replies.map((reply) => (
        <div
          key={reply.id}
          data-testid="inline-comment-reply"
          className="inline-comment-reply ms-4 ms-sm-5 mt-2"
        >
          {/*
           * `InlineCommentReply` carries only `creatorId` (design.md's reply
           * aggregate holds no serialized creator relation), which is a
           * plain string -- a valid, unpopulated `Ref<IUser>`. CommentCard
           * already renders that the same way a normal comment's
           * unpopulated creator ref renders (UserPicture/Username fall back
           * to their own defaults), so this passes through as-is.
           */}
          <CommentCard creator={reply.creatorId} createdAt={reply.createdAt}>
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

      <div className="inline-comment-reply-form ms-4 ms-sm-5 mt-2">
        {isReplyOpen ? (
          <MentionAwareCommentInput
            editorKey={editorKey}
            onSubmit={(comment) => onSubmitReply(parentId, comment)}
            onSubmitted={() => setIsReplyOpen(false)}
            onCancel={() => setIsReplyOpen(false)}
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
