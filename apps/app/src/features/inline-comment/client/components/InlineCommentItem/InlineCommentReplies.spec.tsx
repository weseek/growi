// @vitest-environment happy-dom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultSchema } from 'hast-util-sanitize';
import sanitize from 'rehype-sanitize';
import deepmerge from 'ts-deepmerge';

import type { RendererOptions } from '~/interfaces/renderer-options';
import {
  remarkPlugin as mentionRemarkPlugin,
  sanitizeOption as mentionSanitizeOption,
} from '~/services/renderer/remark-plugins/mention';

import type { InlineCommentReply } from '../../../interfaces';
import { InlineCommentReplies } from './InlineCommentReplies';

// ---------------------------------------------------------------------------
// Module mocks
//
// Same collaborators as InlineCommentItem.spec.tsx mocks — CommentCard's own
// header row (author picture / name / posted date) is CommentCard's own
// concern, not this component's.
// ---------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@growi/ui/dist/components', () => ({
  UserPicture: () => <span data-testid="user-picture" />,
}));

vi.mock('~/components/User/Username', () => ({
  Username: () => <span data-testid="username" />,
}));

vi.mock('~/client/components/FormattedDistanceDate', () => ({
  default: () => <span data-testid="formatted-distance-date" />,
}));

/**
 * Same construction as InlineCommentList.spec.tsx: real mention plugin +
 * real rehype-sanitize, skipping the rest of `generateCommentViewOptions`'s
 * heavy plugin graph. See that file for the rationale.
 */
const buildMentionAwareRendererOptions = (): RendererOptions => ({
  remarkPlugins: [mentionRemarkPlugin],
  rehypePlugins: [[sanitize, deepmerge(defaultSchema, mentionSanitizeOption)]],
  components: {},
});

const reply = (
  overrides: Partial<InlineCommentReply> = {},
): InlineCommentReply => ({
  id: 'reply1',
  pageId: 'page1',
  creatorId: 'user2',
  comment: 'a reply',
  replyToId: 'comment1',
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  ...overrides,
});

describe('InlineCommentReplies', () => {
  it('renders each reply nested under the origin comment (indented container)', () => {
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[
          reply({ id: 'reply1', comment: 'first reply' }),
          reply({ id: 'reply2', comment: 'second reply' }),
        ]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={vi.fn()}
      />,
    );

    const renderedReplies = screen.getAllByTestId('inline-comment-reply');
    expect(renderedReplies).toHaveLength(2);
    expect(renderedReplies[0]).toHaveTextContent('first reply');
    expect(renderedReplies[1]).toHaveTextContent('second reply');
    // Nesting follows ReplyComments.tsx's established indentation classes.
    expect(renderedReplies[0]).toHaveClass('ms-4');
    expect(renderedReplies[0]).toHaveClass('ms-sm-5');
  });

  it('wraps each reply in the same shared comment box a normal comment uses (Req 13.3 / 13.4)', () => {
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[reply({ id: 'reply1', comment: 'first reply' })]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={vi.fn()}
      />,
    );

    const replyContainer = screen.getByTestId('inline-comment-reply');

    // The indentation classes stay on the same element that wraps the box.
    expect(replyContainer).toHaveClass('ms-4', 'ms-sm-5', 'mt-2');

    const pageComment = replyContainer.querySelector('.page-comment');
    expect(pageComment).not.toBeNull();
    expect(pageComment?.parentElement).toBe(replyContainer);

    const main = pageComment?.querySelector(
      '.page-comment-main.bg-comment.rounded',
    );
    expect(main).not.toBeNull();
    expect(main?.parentElement).toBe(pageComment);

    const body = main?.querySelector('.page-comment-body');
    expect(body).not.toBeNull();
    expect(body).toHaveTextContent('first reply');

    // The header row shows the same author picture / name / date collaborators
    // a normal comment's box shows -- owned by CommentCard, not this component.
    const header = main?.querySelector('.d-flex.align-items-center');
    expect(
      header?.querySelector('[data-testid="user-picture"]'),
    ).not.toBeNull();
    expect(header?.querySelector('[data-testid="username"]')).not.toBeNull();
    expect(
      header?.querySelector('[data-testid="formatted-distance-date"]'),
    ).not.toBeNull();
  });

  it('renders no reply items when there are no replies yet', () => {
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={vi.fn()}
      />,
    );

    expect(screen.queryAllByTestId('inline-comment-reply')).toHaveLength(0);
  });

  it('calls onSubmitReply with the parent id and the typed comment text', async () => {
    const onSubmitReply = vi.fn().mockResolvedValue(undefined);
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={onSubmitReply}
      />,
    );

    await userEvent.type(screen.getByLabelText('Reply'), 'thanks for the note');
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.reply' }),
    );

    expect(onSubmitReply).toHaveBeenCalledWith(
      'comment1',
      'thanks for the note',
    );
  });

  it('does not submit an empty or whitespace-only reply', async () => {
    const onSubmitReply = vi.fn();
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={onSubmitReply}
      />,
    );

    await userEvent.type(screen.getByLabelText('Reply'), '   ');
    expect(
      screen.getByRole('button', { name: 'page_comment.reply' }),
    ).toBeDisabled();
    expect(onSubmitReply).not.toHaveBeenCalled();
  });

  it('clears the draft after a successful submission', async () => {
    const onSubmitReply = vi.fn().mockResolvedValue(undefined);
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={onSubmitReply}
      />,
    );

    const textarea = screen.getByLabelText('Reply');
    await userEvent.type(textarea, 'a reply');
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.reply' }),
    );

    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  it('surfaces an error and keeps the draft when onSubmitReply rejects', async () => {
    const onSubmitReply = vi.fn().mockRejectedValue(new Error('network down'));
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={onSubmitReply}
      />,
    );

    const textarea = screen.getByLabelText('Reply');
    await userEvent.type(textarea, 'a reply');
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.reply' }),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('inline-comment-reply-error'),
      ).toHaveTextContent('network down');
    });
    // A failed submit must not silently discard what the user typed.
    expect(textarea).toHaveValue('a reply');
  });

  it('renders @username in a reply body with the real mention plugin markup', async () => {
    render(
      <InlineCommentReplies
        parentId="comment1"
        replies={[reply({ comment: 'cc @bob for visibility' })]}
        rendererOptions={buildMentionAwareRendererOptions()}
        onSubmitReply={vi.fn()}
      />,
    );

    await waitFor(() => {
      const mention = document.querySelector('[data-mention]');
      expect(mention).not.toBeNull();
      expect(mention).toHaveClass('mention-user');
      expect(mention).toHaveAttribute('data-mention', 'bob');
    });
  });
});
