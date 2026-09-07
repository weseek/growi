// @vitest-environment happy-dom

/**
 * Unit tests for the inline-comment list item after it was moved out of
 * `InlineCommentList/` and rewritten to use the shared `CommentCard`
 * (design.md: `InlineCommentItem`（`InlineCommentList` から移動・構造を変更）).
 *
 * Per design.md's Testing Strategy for Req 13.3 / 13.4, these tests walk the
 * container chain as DOM structure — the module container, `.page-comment`,
 * `.page-comment-main.bg-comment.rounded`, the header row and
 * `.page-comment-body` — instead of asserting rendered text. A text-only
 * assertion would still pass if the item were rebuilt as a parallel
 * implementation that merely copied the class names, which is exactly what
 * this task must rule out.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { RendererOptions } from '~/interfaces/renderer-options';

import type { InlineCommentWithReplies } from '../../../interfaces';

// ---------------------------------------------------------------------------
// Module mocks
//
// The unit boundary is the item itself. The author picture / name and the
// distance-date formatter are collaborators owned by `CommentCard`; the
// replies subtree is a separate component with its own spec.
// ---------------------------------------------------------------------------

// `inline-comment-quote` is declared as `:global(.inline-comment-quote)` in the
// real SCSS, so CSS Modules never adds it to the JS-side lookup table — the
// mock must not fabricate that key, or a regression where the component reads
// `styles['inline-comment-quote']` (always `undefined` in the real build)
// would still pass here.
vi.mock('./InlineCommentItem.module.scss', () => ({
  default: {
    'inline-comment-item-styles': 'inline-comment-item-styles',
  },
}));

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

vi.mock('./InlineCommentReplies', () => ({
  InlineCommentReplies: () => <div data-testid="inline-comment-replies" />,
}));

import { InlineCommentItem } from './InlineCommentItem';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * `RevisionRenderer` is deliberately NOT mocked: the class it puts on the
 * rendered markdown (`wiki comment`) is exactly what Req 13.3's spacing rules
 * hang on, so the test needs the real component to observe it. A minimal
 * options object is enough — no plugin behavior is under test here.
 */
const rendererOptions: RendererOptions = {
  remarkPlugins: [],
  rehypePlugins: [],
  components: {},
};

const originComment = (
  overrides: Partial<InlineCommentWithReplies> = {},
): InlineCommentWithReplies => ({
  id: 'comment1',
  pageId: 'page1',
  creatorId: 'user1',
  creator: null,
  comment: 'the comment body',
  anchorOriginRevisionId: 'revision1',
  anchor: {
    quote: 'the quoted range',
    prefix: '',
    suffix: '',
    approxOffset: 0,
  },
  resolvedById: null,
  resolvedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  replies: [],
  ...overrides,
});

const renderItem = (
  overrides: Partial<InlineCommentWithReplies> = {},
  handlers: {
    resolve?: (id: string, resolved: boolean) => Promise<unknown>;
    createReply?: (parentId: string, comment: string) => Promise<unknown>;
    scrollToRange?: (commentId: string) => boolean;
  } = {},
) =>
  render(
    <InlineCommentItem
      comment={originComment(overrides)}
      rendererOptions={rendererOptions}
      resolve={handlers.resolve ?? vi.fn().mockResolvedValue(undefined)}
      createReply={handlers.createReply ?? vi.fn().mockResolvedValue(undefined)}
      scrollToRange={handlers.scrollToRange ?? vi.fn(() => true)}
    />,
  );

const getMain = (container: HTMLElement) =>
  container.querySelector(
    '.inline-comment-item-styles .page-comment .page-comment-main',
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InlineCommentItem', () => {
  describe('the shared comment box (Req 13.3 / 13.4)', () => {
    it('nests the module container > .page-comment > .page-comment-main.bg-comment.rounded', () => {
      const { container } = renderItem();

      const moduleRoot = container.querySelector('.inline-comment-item-styles');
      expect(moduleRoot).not.toBeNull();

      const pageComment = moduleRoot?.querySelector('.page-comment');
      expect(pageComment).not.toBeNull();
      expect(pageComment?.parentElement).toBe(moduleRoot);

      const main = pageComment?.querySelector(
        '.page-comment-main.bg-comment.rounded',
      );
      expect(main).not.toBeNull();
      expect(main?.parentElement).toBe(pageComment);
    });

    it('shows the author picture, the author name and the posted date in the header row of that box', () => {
      const { container } = renderItem();

      const header = getMain(container)?.querySelector(
        '.d-flex.align-items-center',
      );
      expect(header).not.toBeNull();
      expect(
        header?.querySelector('[data-testid="user-picture"]'),
      ).not.toBeNull();
      expect(header?.querySelector('[data-testid="username"]')).not.toBeNull();
      expect(
        header?.querySelector('[data-testid="formatted-distance-date"]'),
      ).not.toBeNull();
    });

    it('marks a resolved item on the box itself and on the item wrapper', () => {
      const { container } = renderItem({
        resolvedById: 'user2',
        resolvedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(
        container.querySelector('[data-testid="inline-comment-item"]'),
      ).toHaveAttribute('data-resolved', 'true');
      expect(
        container.querySelector('.page-comment.inline-comment-item-resolved'),
      ).not.toBeNull();
    });

    it('does not mark an unresolved item as resolved', () => {
      const { container } = renderItem();

      expect(
        container.querySelector('[data-testid="inline-comment-item"]'),
      ).toHaveAttribute('data-resolved', 'false');
      expect(
        container.querySelector('.inline-comment-item-resolved'),
      ).toBeNull();
    });
  });

  describe('the type label row and the quote (Req 13.6 / 13.10)', () => {
    it('places the type label row, then the quote, then the body — all inside the shared box', () => {
      const { container } = renderItem();

      const main = getMain(container);
      expect(main).not.toBeNull();

      const label = screen.getByText('inline_comment.label');
      const quote = main?.querySelector('blockquote.inline-comment-quote');
      const body = main?.querySelector('.page-comment-body');

      expect(quote).not.toBeNull();
      expect(body).not.toBeNull();

      // every one of them lives inside the shared box
      const labelRow = label.closest('.page-comment-main');
      expect(labelRow).toBe(main);

      const children = Array.from(main?.children ?? []);
      const indexOf = (el: Element | null | undefined) =>
        children.indexOf(el as Element);

      const labelRowElement = children.find((child) => child.contains(label));
      // the quote lives inside a clickable `<button>` wrapper (task 4.3), so
      // its box-order position is the wrapper's index, not its own.
      const quoteRowElement = children.find((child) =>
        child.contains(quote ?? null),
      );
      expect(indexOf(labelRowElement)).toBeGreaterThanOrEqual(0);
      expect(indexOf(labelRowElement)).toBeLessThan(indexOf(quoteRowElement));
      expect(indexOf(quoteRowElement)).toBeLessThan(indexOf(body));
    });

    it('shows an icon next to the type label', () => {
      renderItem();

      const label = screen.getByText('inline_comment.label');
      expect(
        label.closest('div')?.querySelector('.material-symbols-outlined'),
      ).not.toBeNull();
    });

    it('shows the anchored quote text in the quote element', () => {
      const { container } = renderItem({
        anchor: {
          quote: 'a distinctive quoted range',
          prefix: '',
          suffix: '',
          approxOffset: 0,
        },
      });

      const quote = container.querySelector('blockquote.inline-comment-quote');
      expect(quote).toHaveTextContent('a distinctive quoted range');
    });

    it('calls scrollToRange(comment.id) when the quote is clicked (Req 3.1)', async () => {
      const scrollToRange = vi.fn(() => true);
      const { container } = renderItem({}, { scrollToRange });

      const quote = container.querySelector('blockquote.inline-comment-quote');
      expect(quote).not.toBeNull();

      await userEvent.click(quote as Element);

      expect(scrollToRange).toHaveBeenCalledWith('comment1');
    });

    it('calls scrollToRange(comment.id) when the quote button is activated with the keyboard (Enter)', async () => {
      const scrollToRange = vi.fn(() => true);
      const { container } = renderItem({}, { scrollToRange });

      const quoteButton = container
        .querySelector('blockquote.inline-comment-quote')
        ?.closest('button');
      expect(quoteButton).not.toBeNull();

      (quoteButton as HTMLButtonElement).focus();
      await userEvent.keyboard('{Enter}');

      expect(scrollToRange).toHaveBeenCalledWith('comment1');
    });
  });

  describe('the status badge and the resolve toggle (Req 13.7)', () => {
    it('puts both the badge and the toggle at the end of the header row of the shared box', () => {
      const { container } = renderItem();

      const header = getMain(container)?.querySelector(
        '.d-flex.align-items-center',
      );
      const headerEnd = header?.querySelector('.ms-auto');
      expect(headerEnd).not.toBeNull();
      expect(headerEnd?.parentElement).toBe(header);

      const badge = headerEnd?.querySelector(
        '[data-testid="inline-comment-status"]',
      );
      const toggle = headerEnd?.querySelector('button');
      expect(badge).not.toBeNull();
      expect(toggle).not.toBeNull();
    });

    it('keeps the unresolved badge colour scheme (bg-warning text-dark)', () => {
      renderItem();

      const badge = screen.getByTestId('inline-comment-status');
      expect(badge).toHaveClass('badge', 'bg-warning', 'text-dark');
      expect(badge).toHaveTextContent('inline_comment.unresolved');
    });

    it('switches the badge to the resolved variant when the comment is resolved', () => {
      renderItem({
        resolvedById: 'user2',
        resolvedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const badge = screen.getByTestId('inline-comment-status');
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).toHaveTextContent('inline_comment.resolved');
    });

    it('calls resolve(id, true) when an unresolved comment is resolved', async () => {
      const resolve = vi.fn().mockResolvedValue(undefined);
      renderItem({}, { resolve });

      await userEvent.click(
        screen.getByRole('button', { name: 'inline_comment.resolve' }),
      );

      expect(resolve).toHaveBeenCalledWith('comment1', true);
    });

    it('calls resolve(id, false) when a resolved comment is reopened', async () => {
      const resolve = vi.fn().mockResolvedValue(undefined);
      renderItem(
        {
          resolvedById: 'user2',
          resolvedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
        { resolve },
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'inline_comment.reopen' }),
      );

      expect(resolve).toHaveBeenCalledWith('comment1', false);
    });

    it('surfaces an error and keeps the item on screen when resolve() rejects', async () => {
      const resolve = vi.fn().mockRejectedValue(new Error('network down'));
      renderItem({}, { resolve });

      await userEvent.click(
        screen.getByRole('button', { name: 'inline_comment.resolve' }),
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('inline-comment-resolve-error'),
        ).toHaveTextContent('network down');
      });
      expect(screen.getByTestId('inline-comment-item')).toBeInTheDocument();
    });
  });

  describe('the comment body', () => {
    it('renders the body through RevisionRenderer with the comment class, inside .page-comment-body', async () => {
      // Req 13.3: without `additionalClassName="comment"` the rendered markdown
      // only gets `wiki`, so `Comment.module.scss`'s paragraph / blockquote
      // spacing rules (scoped to `.wiki.comment`) never apply to an inline
      // comment. Asserting the emitted class is the observable form of that.
      const { container } = renderItem({ comment: 'the comment body' });

      await waitFor(() => {
        expect(container.querySelector('.wiki.comment')).not.toBeNull();
      });

      const body = getMain(container)?.querySelector('.page-comment-body');
      expect(body?.querySelector('.wiki.comment')).not.toBeNull();
      expect(body).toHaveTextContent('the comment body');
    });

    it('falls back to plain text while the renderer options are still loading', () => {
      const { container } = render(
        <InlineCommentItem
          comment={originComment({ comment: 'unrendered body' })}
          rendererOptions={undefined}
          resolve={vi.fn()}
          createReply={vi.fn()}
          scrollToRange={vi.fn(() => true)}
        />,
      );

      expect(container.querySelector('.wiki')).toBeNull();
      expect(
        getMain(container)?.querySelector('.page-comment-body'),
      ).toHaveTextContent('unrendered body');
    });
  });

  describe('the replies subtree', () => {
    it('renders the replies outside the shared comment box, not nested inside it', () => {
      const { container } = renderItem();

      const replies = container.querySelector(
        '[data-testid="inline-comment-replies"]',
      );
      expect(replies).not.toBeNull();
      expect(replies?.closest('.page-comment')).toBeNull();
    });
  });
});
