// @vitest-environment happy-dom

/**
 * Unit tests for the content-preview + simple-reply popover shown when a
 * saved inline-comment highlight is hovered/clicked/tapped (design.md 決定2,
 * requirements.md Requirement 2, ACs 2.3/2.4/2.5).
 *
 * Positioning follows the exact same building blocks as `SelectionPopover`
 * (`rangeToVirtualElement` + `usePopperPosition`, portaled into
 * `document.body`), so `@popperjs/core` is mocked at the same low level as
 * `SelectionPopover.spec.tsx` -- the reference/popper elements actually
 * passed to `createPopper` are the only observable proving that wiring is
 * complete, not merely present.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'vitest-mock-extended';

import type { RendererOptions } from '~/interfaces/renderer-options';

import type { InlineCommentWithReplies } from '../../../interfaces';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockCreatePopper = vi.fn(
  (_reference: unknown, _popper: unknown, _options: unknown) => ({
    destroy: vi.fn(),
    update: vi.fn(),
    setOptions: vi.fn(),
  }),
);

vi.mock('@popperjs/core', () => ({
  createPopper: (reference: unknown, popper: unknown, options: unknown) =>
    mockCreatePopper(reference, popper, options),
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

import { InlineCommentPreviewPopover } from './InlineCommentPreviewPopover';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const buildRect = (overrides: Partial<DOMRect> = {}): DOMRect =>
  ({
    x: 10,
    y: 20,
    width: 100,
    height: 16,
    top: 20,
    left: 10,
    right: 110,
    bottom: 36,
    toJSON: () => ({}),
    ...overrides,
  }) as DOMRect;

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

const buildRange = (rect: DOMRect = buildRect()): Range =>
  mock<Range>({ getBoundingClientRect: vi.fn(() => rect) });

const renderPopover = (
  overrides: Partial<InlineCommentWithReplies> = {},
  handlers: {
    createReply?: (parentId: string, comment: string) => Promise<unknown>;
    onClose?: () => void;
  } = {},
  range: Range = buildRange(),
) =>
  render(
    <InlineCommentPreviewPopover
      comment={originComment(overrides)}
      range={range}
      rendererOptions={rendererOptions}
      createReply={handlers.createReply ?? vi.fn().mockResolvedValue(undefined)}
      onClose={handlers.onClose ?? vi.fn()}
    />,
  );

describe('InlineCommentPreviewPopover', () => {
  beforeEach(() => {
    mockCreatePopper.mockClear();
  });

  it('renders its content through a portal into document.body, positioned via the popper mechanism', () => {
    const { container } = renderPopover();

    const popover = screen.getByTestId('inline-comment-preview-popover');
    expect(document.body).toContainElement(popover);
    expect(container).not.toContainElement(popover);
    expect(mockCreatePopper).toHaveBeenCalledTimes(1);
  });

  it('shows the author, posted date, and body of the origin comment (Req 2.1)', () => {
    renderPopover({ comment: 'the comment body' });

    const popover = screen.getByTestId('inline-comment-preview-popover');
    expect(
      popover.querySelector('[data-testid="user-picture"]'),
    ).not.toBeNull();
    expect(popover.querySelector('[data-testid="username"]')).not.toBeNull();
    expect(
      popover.querySelector('[data-testid="formatted-distance-date"]'),
    ).not.toBeNull();
    expect(popover).toHaveTextContent('the comment body');
  });

  it('shows the existing replies (Req 2.1)', () => {
    renderPopover({
      replies: [
        {
          id: 'reply1',
          pageId: 'page1',
          creatorId: 'user2',
          comment: 'an existing reply',
          replyToId: 'comment1',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    });

    const popover = screen.getByTestId('inline-comment-preview-popover');
    expect(popover).toHaveTextContent('an existing reply');
  });

  it('submits the typed text through createReply with the comment id (Req 2.3)', async () => {
    const createReply = vi.fn().mockResolvedValue(undefined);
    renderPopover({ id: 'comment42' }, { createReply });

    await userEvent.type(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
      'a quick reply',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.comment' }),
    );

    expect(createReply).toHaveBeenCalledWith('comment42', 'a quick reply');
  });

  it('does not submit an empty or whitespace-only reply (Req 2.3)', async () => {
    const createReply = vi.fn();
    renderPopover({}, { createReply });

    await userEvent.type(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
      '   ',
    );

    expect(
      screen.getByRole('button', { name: 'page_comment.comment' }),
    ).toBeDisabled();
    expect(createReply).not.toHaveBeenCalled();
  });

  it('clears the draft after a successful submission', async () => {
    const createReply = vi.fn().mockResolvedValue(undefined);
    renderPopover({}, { createReply });

    const textarea = screen.getByPlaceholderText(
      'inline_comment.reply_placeholder',
    );
    await userEvent.type(textarea, 'a reply');
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.comment' }),
    );

    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  it('surfaces an error and keeps the draft when createReply rejects', async () => {
    const createReply = vi.fn().mockRejectedValue(new Error('network down'));
    renderPopover({}, { createReply });

    const textarea = screen.getByPlaceholderText(
      'inline_comment.reply_placeholder',
    );
    await userEvent.type(textarea, 'a reply');
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.comment' }),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('inline-comment-preview-popover-reply-error'),
      ).toHaveTextContent('network down');
    });
    expect(textarea).toHaveValue('a reply');
  });

  it('has no controls for editing the origin comment body (Req 2.5)', () => {
    renderPopover();

    const popover = screen.getByTestId('inline-comment-preview-popover');
    // Only the single reply textarea should exist -- none targeting the
    // origin comment's own body.
    expect(popover.querySelectorAll('textarea')).toHaveLength(1);
    expect(
      screen.queryByRole('button', { name: /edit/i }),
    ).not.toBeInTheDocument();
  });

  it('closes on an explicit close-button click (Req 2.4)', async () => {
    const onClose = vi.fn();
    renderPopover({}, { onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside the popover (Req 2.4)', () => {
    const onClose = vi.fn();
    renderPopover({}, { onClose });

    // Outside the portal entirely.
    const outsideNode = document.createElement('div');
    document.body.appendChild(outsideNode);

    outsideNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideNode);
  });

  it('does not close when clicking inside the popover', async () => {
    const onClose = vi.fn();
    renderPopover({}, { onClose });

    await userEvent.click(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
    );

    expect(onClose).not.toHaveBeenCalled();
  });
});
