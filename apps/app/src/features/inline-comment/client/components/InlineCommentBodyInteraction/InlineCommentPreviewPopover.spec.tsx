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

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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

// The current user drives the author-only check for the edit affordance
// (`comment.creatorId === currentUser?._id`, same check
// `InlineCommentItem.tsx` uses). Mutable via `currentUserRef` so individual
// tests can simulate "viewing as the comment's own author" vs. "viewing as
// someone else".
const currentUserRef = vi.hoisted(
  () => ({ current: undefined }) as { current?: { _id: string } },
);
vi.mock('~/states/global', () => ({
  useCurrentUser: () => currentUserRef.current,
}));

// The read-only restriction is `NotAvailableIfReadOnlyUserNotAllowedToComment`'s
// own concern (it already has its own tests) -- mocked directly at the
// component boundary exactly as `InlineCommentItem.spec.tsx` mocks it, so a
// test here can assert "the popover's edit control is disabled under the
// read-only restriction" without re-deriving `NotAvailable`'s own DOM
// rendering.
const isDisabledRef = vi.hoisted(() => ({ current: false }));
vi.mock('~/client/components/NotAvailableForReadOnlyUser', () => ({
  NotAvailableIfReadOnlyUserNotAllowedToComment: ({
    children,
  }: {
    children: JSX.Element;
  }) => {
    if (!isDisabledRef.current) {
      return children;
    }
    return (
      <fieldset disabled data-testid="not-available-for-read-only-user">
        {children}
      </fieldset>
    );
  },
}));

// MentionAwareCommentInput owns a real CodeMirror editor assembly -- mocked
// at the component boundary exactly as InlineCommentItem.spec.tsx mocks it,
// so this file can drive the edit form's onSubmit without instantiating
// CodeMirror.
const mentionAwareCommentInputProps = vi.hoisted(
  () => ({ current: undefined }) as { current?: Record<string, unknown> },
);
vi.mock('../MentionAwareCommentInput/MentionAwareCommentInput', () => ({
  MentionAwareCommentInput: (props: Record<string, unknown>) => {
    mentionAwareCommentInputProps.current = props;
    return <div data-testid="mention-aware-comment-input-mock" />;
  },
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
    resolve?: (id: string, resolved: boolean) => Promise<unknown>;
    update?: (id: string, comment: string) => Promise<unknown>;
    onPointerEnter?: () => void;
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
      resolve={handlers.resolve ?? vi.fn().mockResolvedValue(undefined)}
      update={handlers.update ?? vi.fn().mockResolvedValue(undefined)}
      onPointerEnter={handlers.onPointerEnter ?? vi.fn()}
    />,
  );

describe('InlineCommentPreviewPopover', () => {
  beforeEach(() => {
    mockCreatePopper.mockClear();
    currentUserRef.current = undefined;
    mentionAwareCommentInputProps.current = undefined;
    isDisabledRef.current = false;
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
    // Scoped to the origin comment's own header row (not the whole popover):
    // the reply composer added in task 3 also renders a UserPicture, so an
    // unscoped query here would still pass even if the origin comment's own
    // avatar were missing (same scoping InlineCommentItem.spec.tsx uses).
    const header = popover.querySelector('.d-flex.align-items-center');
    expect(header).not.toBeNull();
    expect(
      header?.querySelector('[data-testid="user-picture"]'),
    ).not.toBeNull();
    expect(header?.querySelector('[data-testid="username"]')).not.toBeNull();
    expect(
      header?.querySelector('[data-testid="formatted-distance-date"]'),
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
          creator: null,
          comment: 'an existing reply',
          replyToId: 'comment1',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    });

    const popover = screen.getByTestId('inline-comment-preview-popover');
    expect(popover).toHaveTextContent('an existing reply');

    // The replies container gets a left border to visually group the
    // thread's replies together (design.md: border-start ps-3 utility
    // classes, no new SCSS rule).
    const repliesContainer = screen.getByTestId(
      'inline-comment-preview-popover-replies',
    );
    expect(repliesContainer).toHaveClass('border-start', 'ps-3');
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

  it("hides the edit affordance when the current user is not the comment's own creator", () => {
    currentUserRef.current = { _id: 'someone-else' };
    renderPopover({ creatorId: 'user1' });

    expect(
      screen.queryByTestId('inline-comment-preview-popover-edit-button'),
    ).not.toBeInTheDocument();
  });

  it('hides the edit affordance when there is no current user', () => {
    currentUserRef.current = undefined;
    renderPopover({ creatorId: 'user1' });

    expect(
      screen.queryByTestId('inline-comment-preview-popover-edit-button'),
    ).not.toBeInTheDocument();
  });

  it('disables the edit control under the read-only restriction (Requirement 18, AC 18.4)', () => {
    currentUserRef.current = { _id: 'user1' };
    isDisabledRef.current = true;
    renderPopover({ creatorId: 'user1' });

    expect(
      screen.getByTestId('not-available-for-read-only-user'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('inline-comment-preview-popover-edit-button'),
    ).toBeDisabled();
  });

  it("shows the edit affordance and updates the origin comment through `update` when the current user is the comment's own creator (Requirement 15, AC 15.5)", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    currentUserRef.current = { _id: 'user1' };
    renderPopover({ id: 'comment42', creatorId: 'user1' }, { update });

    await userEvent.click(
      screen.getByTestId('inline-comment-preview-popover-edit-button'),
    );

    expect(
      screen.getByTestId('mention-aware-comment-input-mock'),
    ).toBeInTheDocument();
    expect(mentionAwareCommentInputProps.current?.initialValue).toBe(
      'the comment body',
    );

    await act(async () => {
      await (
        mentionAwareCommentInputProps.current?.onSubmit as (
          text: string,
        ) => Promise<unknown>
      )('the edited comment body');
    });

    expect(update).toHaveBeenCalledWith('comment42', 'the edited comment body');
    await waitFor(() => {
      expect(
        screen.queryByTestId('mention-aware-comment-input-mock'),
      ).not.toBeInTheDocument();
    });
  });

  it('wraps the edit-mode input in an accent-colored border using semantic Bootstrap classes (Req 2.2, 3.1)', async () => {
    currentUserRef.current = { _id: 'user1' };
    renderPopover({ id: 'comment42', creatorId: 'user1' });

    await userEvent.click(
      screen.getByTestId('inline-comment-preview-popover-edit-button'),
    );

    const editForm = screen.getByTestId(
      'inline-comment-preview-popover-edit-form',
    );
    // Semantic Bootstrap accent-border utility classes only -- no hardcoded
    // hex color, no inline style (Requirement 3.1).
    expect(editForm).toHaveClass('border', 'border-primary', 'rounded');
    expect(editForm.getAttribute('style')).toBeFalsy();
  });

  it('places the Cancel button below the input, right-aligned (Req 2.2)', async () => {
    currentUserRef.current = { _id: 'user1' };
    renderPopover({ id: 'comment42', creatorId: 'user1' });

    await userEvent.click(
      screen.getByTestId('inline-comment-preview-popover-edit-button'),
    );

    const cancelButton = screen.getByTestId(
      'inline-comment-preview-popover-edit-cancel-button',
    );
    const actionsRow = cancelButton.parentElement;
    expect(actionsRow).toHaveClass('d-flex', 'justify-content-end');
  });

  it('replaces the reply thread and the reply form while editing, restoring both on cancel (Req 2.2)', async () => {
    currentUserRef.current = { _id: 'user1' };
    renderPopover({
      id: 'comment42',
      creatorId: 'user1',
      replies: [
        {
          id: 'reply1',
          pageId: 'page1',
          creatorId: 'user2',
          creator: null,
          comment: 'a reply',
          replyToId: 'comment42',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    });

    // Before editing, both are on screen.
    expect(
      screen.getByTestId('inline-comment-preview-popover-replies'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByTestId('inline-comment-preview-popover-edit-button'),
    );

    // Requirement 2.2's edit-mode artboard shows the header, the quote, the
    // editor and its buttons -- and nothing else. Editing replaces what is
    // below the quote wholesale, rather than pushing the editor in above a
    // still-live reply thread and reply box.
    expect(
      screen.queryByTestId('inline-comment-preview-popover-replies'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('inline_comment.reply_placeholder'),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByTestId('inline-comment-preview-popover-edit-cancel-button'),
    );

    expect(
      screen.getByTestId('inline-comment-preview-popover-replies'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
    ).toBeInTheDocument();
  });

  it('places the close button as the last element of the header row, not absolutely positioned over the card corner', () => {
    currentUserRef.current = { _id: 'user1' };
    renderPopover({ creatorId: 'user1' });

    const closeButton = screen.getByTestId(
      'inline-comment-preview-popover-close-button',
    );
    // It used to be `position-absolute top-0 end-0` on the card body, which
    // put it above the header row in the card's own top padding, where it
    // collided with the popover's rounded corner.
    expect(closeButton).not.toHaveClass('position-absolute');

    // `closest`, not the render result's `container`: this popover renders
    // through a portal into `document.body`, so it is not inside `container`.
    const headerEnd = closeButton.closest('.ms-auto');
    expect(headerEnd).not.toBeNull();
    expect(headerEnd?.lastElementChild).toBe(closeButton);
    // The header row the slot sits in is the comment card's own header.
    expect(headerEnd?.closest('.page-comment-main')).not.toBeNull();
  });

  it('has no delete action anywhere in the rendered output (Boundary Context: delete is list-only)', () => {
    currentUserRef.current = { _id: 'user1' };
    renderPopover({ creatorId: 'user1' });

    expect(
      screen.queryByRole('button', { name: /delete/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('inline-comment-delete-button'),
    ).not.toBeInTheDocument();
  });

  it('renders the resolved/unresolved status badge with the same class composition as the list item (Req 1.7, 2.3)', () => {
    const { rerender } = renderPopover({ resolvedAt: null });

    const unresolvedBadge = screen.getByTestId('inline-comment-status');
    expect(unresolvedBadge).toHaveClass('badge', 'rounded-pill');
    expect(unresolvedBadge).toHaveClass(
      'bg-warning-subtle',
      'text-warning-emphasis',
    );

    rerender(
      <InlineCommentPreviewPopover
        comment={originComment({
          resolvedAt: new Date('2026-01-03T00:00:00.000Z'),
        })}
        range={buildRange()}
        rendererOptions={rendererOptions}
        createReply={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
        resolve={vi.fn().mockResolvedValue(undefined)}
        update={vi.fn().mockResolvedValue(undefined)}
        onPointerEnter={vi.fn()}
      />,
    );

    const resolvedBadge = screen.getByTestId('inline-comment-status');
    expect(resolvedBadge).toHaveClass('badge', 'rounded-pill');
    expect(resolvedBadge).toHaveClass(
      'bg-success-subtle',
      'text-success-emphasis',
    );
  });

  it('gives the resolve-toggle button the same rounded-pill class composition as the list item (Req 2.3)', () => {
    renderPopover({ resolvedAt: null });

    const toggleButton = screen.getByRole('button', {
      name: 'inline_comment.resolve',
    });
    expect(toggleButton).toHaveClass(
      'btn',
      'btn-sm',
      'btn-outline-secondary',
      'rounded-pill',
    );
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

  it('renders a Resolve control for an unresolved comment, and toggles to resolved on click (Req 4.6)', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined);
    renderPopover({ id: 'comment42', resolvedAt: null }, { resolve });

    await userEvent.click(
      screen.getByRole('button', { name: 'inline_comment.resolve' }),
    );

    expect(resolve).toHaveBeenCalledWith('comment42', true);
  });

  it('renders a Reopen control for a resolved comment, and toggles to unresolved on click (Req 4.6)', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined);
    renderPopover(
      { id: 'comment42', resolvedAt: new Date('2026-01-03T00:00:00.000Z') },
      { resolve },
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'inline_comment.reopen' }),
    );

    expect(resolve).toHaveBeenCalledWith('comment42', false);
  });

  it('displays an error when the resolve toggle rejects, without closing the popover (Req 4.6)', async () => {
    const resolve = vi.fn().mockRejectedValue(new Error('permission denied'));
    const onClose = vi.fn();
    renderPopover({ resolvedAt: null }, { resolve, onClose });

    await userEvent.click(
      screen.getByRole('button', { name: 'inline_comment.resolve' }),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('inline-comment-resolve-error'),
      ).toHaveTextContent('permission denied');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates the displayed resolved state after a successful toggle (Req 4.6)', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined);
    renderPopover({ resolvedAt: null }, { resolve });

    await userEvent.click(
      screen.getByRole('button', { name: 'inline_comment.resolve' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId('inline-comment-resolve-error'),
      ).not.toBeInTheDocument();
    });
  });

  it('calls onPointerEnter when the pointer enters the popover root (Req 15.9)', () => {
    const onPointerEnter = vi.fn();
    renderPopover({}, { onPointerEnter });

    const popover = screen.getByTestId('inline-comment-preview-popover');
    fireEvent.mouseEnter(popover);

    expect(onPointerEnter).toHaveBeenCalledTimes(1);
  });

  it('renders the anchored quote in a strip visually distinct from the comment body (Req 15.11)', () => {
    renderPopover({
      comment: 'the comment body',
      anchor: {
        quote: 'the quoted range',
        prefix: '',
        suffix: '',
        approxOffset: 0,
      },
    });

    const popover = screen.getByTestId('inline-comment-preview-popover');
    const quoteStrip = screen.getByTestId(
      'inline-comment-preview-popover-quote',
    );

    expect(popover).toContainElement(quoteStrip);
    expect(quoteStrip).toHaveTextContent('the quoted range');
    // Distinct from the comment body: the quote text never appears inside
    // the body's own rendered markdown.
    expect(quoteStrip).not.toHaveTextContent('the comment body');
  });

  it('unifies the quote block class composition with the list item (Req 1.7) and drops the inline style', () => {
    renderPopover({
      anchor: {
        quote: 'the quoted range',
        prefix: '',
        suffix: '',
        approxOffset: 0,
      },
    });

    const quoteStrip = screen.getByTestId(
      'inline-comment-preview-popover-quote',
    );

    // Same left-border/background class composition as InlineCommentItem's
    // own quote block -- the accent-colored left border comes from the
    // shared `.inline-comment-quote` rule (border-left:
    // var(--grw-inline-comment-marker-bg)), not from a component-local color.
    expect(quoteStrip).toHaveClass('inline-comment-quote', 'bg-body-tertiary');
    // The 2-line clamp must now be expressed as a CSS Modules class, not an
    // inline style attribute (Requirement 3.3).
    expect(quoteStrip.getAttribute('style')).toBeFalsy();
  });

  it('renders the reply composer as an avatar + input row with an icon send button (Req 15.3)', () => {
    renderPopover();

    // Scoped to the composer row itself, not the whole popover -- the origin
    // comment's own CommentCard header already renders a (mocked)
    // user-picture, so asserting against the full popover would pass even
    // without the composer's own avatar.
    const composer = document.querySelector(
      '.inline-comment-preview-popover-reply-form',
    );
    const textarea = screen.getByPlaceholderText(
      'inline_comment.reply_placeholder',
    );
    const sendButton = screen.getByRole('button', {
      name: 'page_comment.comment',
    });

    expect(composer).not.toBeNull();
    expect(
      composer?.querySelector('[data-testid="user-picture"]'),
    ).not.toBeNull();
    expect(composer).toContainElement(textarea);
    expect(composer).toContainElement(sendButton);
    // The reply input is rounded (rounded-pill), suited to a single-line
    // input, per design.md -- the send button stays the existing circular
    // button and is not touched here.
    expect(textarea).toHaveClass('form-control', 'rounded-pill');
  });

  it('still calls createReply when submitting via the restyled composer (Req 15.3)', async () => {
    const createReply = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderPopover({ id: 'comment42' }, { createReply, onClose });

    await userEvent.type(
      screen.getByPlaceholderText('inline_comment.reply_placeholder'),
      'a restyled reply',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'page_comment.comment' }),
    );

    expect(createReply).toHaveBeenCalledWith('comment42', 'a restyled reply');
    // Req 15.3: the popover stays open after a successful reply submission.
    expect(onClose).not.toHaveBeenCalled();
  });
});
