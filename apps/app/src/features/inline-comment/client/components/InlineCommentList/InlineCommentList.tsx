/**
 * Page-scoped inline-comment list (design.md: File Structure Plan >
 * `InlineCommentList/InlineCommentList.tsx`, "一覧表示（作成日時順、解決/
 * 未解決を区別）").
 *
 * Renders `useSWRxInlineComments(pageId)`'s list in the order the server
 * returns it. `InlineCommentService.listByPageId` (task 3.3, approved)
 * already sorts by creation date server-side (requirement 2.6), so this
 * component intentionally does not re-sort — re-sorting here would be a
 * second, drift-prone source of ordering truth.
 *
 * Everything about how a single comment looks — the shared comment box, the
 * status badge, the resolve toggle, the quote and the replies — belongs to
 * `InlineCommentItem` (`../InlineCommentItem/`). This component only fetches
 * and iterates.
 *
 * It supplies the item with the SAME `RendererOptions` the existing page-end
 * comment feature uses (`useCommentForCurrentPageOptions`, backed by
 * `generateCommentViewOptions` — the function that injects the real `mention`
 * remark plugin), so `@username` gets the same mention-highlight markup as
 * everywhere else in the comment feature (requirement 3.1).
 */
import type { FC, JSX } from 'react';

import { useCommentForCurrentPageOptions } from '~/stores/renderer';

import { useSWRxInlineComments } from '../../stores/inline-comment';
import { InlineCommentItem } from '../InlineCommentItem/InlineCommentItem';

type InlineCommentListProps = {
  pageId: string;
};

export const InlineCommentList: FC<InlineCommentListProps> = (
  props,
): JSX.Element | null => {
  const { pageId } = props;

  const {
    data: inlineComments,
    resolve,
    createReply,
  } = useSWRxInlineComments(pageId);
  const { data: rendererOptions } = useCommentForCurrentPageOptions();

  if (inlineComments == null) {
    return null;
  }

  return (
    <div data-testid="inline-comment-list" className="inline-comment-list">
      {inlineComments.map((comment) => (
        <InlineCommentItem
          key={comment.id}
          comment={comment}
          rendererOptions={rendererOptions}
          resolve={resolve}
          createReply={(parentId, replyComment) =>
            createReply(parentId, { comment: replyComment })
          }
        />
      ))}
    </div>
  );
};
