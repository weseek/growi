// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { defaultSchema } from 'hast-util-sanitize';
import sanitize from 'rehype-sanitize';
import ts_deepmerge from 'ts-deepmerge';

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
// CommentCard's own header row (author picture / name / posted date) is
// CommentCard's own concern, not this component's -- same as before.
//
// The reply-composition UI is now the literal same `CommentEditor` the
// normal page-bottom comment thread uses. `CommentEditor` has its own
// dedicated spec (CommentEditor.spec.tsx) covering its internals (CodeMirror
// assembly, upload, Slack notification, the `onSubmit` override contract),
// so this file mocks `CommentEditor` at the component boundary rather than
// re-testing its internals -- the observable contract under test here is
// "clicking Reply... opens the editor with the right props (pageId /
// revisionId / replyTo / onSubmit wired to onSubmitReply), Cancel and a
// successful submit both close it back to the toggle button".
// ---------------------------------------------------------------------------

const commentEditorProps = vi.hoisted(
  () => ({ current: undefined }) as { current?: Record<string, unknown> },
);

vi.mock('~/client/components/PageComment/CommentEditor', () => ({
  CommentEditor: (props: Record<string, unknown>) => {
    commentEditorProps.current = props;
    return <div data-testid="inline-comment-reply-editor-mock" />;
  },
}));

// Real translation value for `page_comment.reply` (see
// public/static/locales/en_US/translation.json: "reply": "Reply") so tests
// can assert the actual composed "Reply..." label (Requirement 4.1), not
// just the raw i18n key -- a wording regression (e.g. dropping the literal
// "..." suffix) would otherwise pass unnoticed against a key-echoing mock.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'page_comment.reply' ? 'Reply' : key),
  }),
}));

vi.mock('@growi/ui/dist/components', () => ({
  UserPicture: () => <span data-testid="user-picture" />,
}));

vi.mock('~/components/User/Username', () => ({
  Username: () => <span data-testid="username" />,
}));

// The current user drives the per-reply author-only check for edit/delete
// (design.md: `reply.creatorId === currentUser?._id`, never the populated
// `creator`). Mutable via `currentUserRef` so individual tests can simulate
// "viewing as a reply's own author" vs. "viewing as someone else".
const currentUserRef = vi.hoisted(
  () => ({ current: undefined }) as { current?: { _id: string } },
);
vi.mock('~/states/global', () => ({
  useCurrentUser: () => currentUserRef.current,
}));

// The read-only restriction is `NotAvailableIfReadOnlyUserNotAllowedToComment`'s
// own concern (it already has its own tests) -- mocked here at the component
// boundary, toggled per test via `isDisabledRef`.
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

// `MentionAwareCommentInput` has its own dedicated spec (initialValue
// application, submit/error handling) -- mocked at the boundary here, same
// rationale as mocking `CommentEditor` above.
const mentionAwareCommentInputProps = vi.hoisted(
  () => ({ current: undefined }) as { current?: Record<string, unknown> },
);
vi.mock('../MentionAwareCommentInput/MentionAwareCommentInput', () => ({
  MentionAwareCommentInput: (props: Record<string, unknown>) => {
    mentionAwareCommentInputProps.current = props;
    return <div data-testid="mention-aware-comment-input-mock" />;
  },
}));

vi.mock('~/client/components/FormattedDistanceDate', () => ({
  default: () => <span data-testid="formatted-distance-date" />,
}));

/**
 * Same construction as InlineCommentItem.spec.tsx: real mention plugin +
 * real rehype-sanitize, skipping the rest of `generateCommentViewOptions`'s
 * heavy plugin graph. See that file for the rationale.
 */
const buildMentionAwareRendererOptions = (): RendererOptions => ({
  remarkPlugins: [mentionRemarkPlugin],
  rehypePlugins: [
    [sanitize, ts_deepmerge(defaultSchema, mentionSanitizeOption)],
  ],
  components: {},
});

const reply = (
  overrides: Partial<InlineCommentReply> = {},
): InlineCommentReply => ({
  id: 'reply1',
  pageId: 'page1',
  creatorId: 'user2',
  creator: null,
  comment: 'a reply',
  replyToId: 'comment1',
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  ...overrides,
});

const renderReplies = (
  overrides: Partial<Parameters<typeof InlineCommentReplies>[0]> = {},
) =>
  render(
    <InlineCommentReplies
      parentId="comment1"
      pageId="page1"
      revisionId="revision1"
      replies={[]}
      rendererOptions={buildMentionAwareRendererOptions()}
      onSubmitReply={vi.fn().mockResolvedValue(undefined)}
      updateReply={vi.fn().mockResolvedValue(undefined)}
      removeReply={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );

describe('InlineCommentReplies', () => {
  beforeEach(() => {
    commentEditorProps.current = undefined;
    currentUserRef.current = undefined;
    isDisabledRef.current = false;
    mentionAwareCommentInputProps.current = undefined;
  });

  it('renders each reply nested under the origin comment (indented container)', () => {
    renderReplies({
      replies: [
        reply({ id: 'reply1', comment: 'first reply' }),
        reply({ id: 'reply2', comment: 'second reply' }),
      ],
    });

    const renderedReplies = screen.getAllByTestId('inline-comment-reply');
    expect(renderedReplies).toHaveLength(2);
    // Nesting follows ReplyComments.tsx's established indentation classes.
    expect(renderedReplies[0]).toHaveClass('ms-4');
    expect(renderedReplies[0]).toHaveClass('ms-sm-5');
  });

  it("renders replies oldest-first even though the `replies` prop arrives newest-first (matches a normal comment thread's display order)", () => {
    // `replies` arrives in the server's `createdAt: 'desc'` fetch order
    // (newest first) -- InlineCommentService.listByPageId() never
    // reorders for display, display order is this component's own
    // concern. Mirrors PageComment.tsx's `commentsFromOldest` reversal.
    renderReplies({
      replies: [
        reply({
          id: 'reply-newer',
          comment: 'the newer reply',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
        }),
        reply({
          id: 'reply-older',
          comment: 'the older reply',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ],
    });

    const renderedReplies = screen.getAllByTestId('inline-comment-reply');
    expect(renderedReplies[0]).toHaveTextContent('the older reply');
    expect(renderedReplies[1]).toHaveTextContent('the newer reply');
  });

  it('wraps each reply in the same shared comment box a normal comment uses (Req 13.3 / 13.4)', () => {
    renderReplies({
      replies: [reply({ id: 'reply1', comment: 'first reply' })],
    });

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
    renderReplies({ replies: [] });

    expect(screen.queryAllByTestId('inline-comment-reply')).toHaveLength(0);
  });

  it('renders @username in a reply body with the real mention plugin markup', async () => {
    renderReplies({ replies: [reply({ comment: 'cc @bob for visibility' })] });

    await waitFor(() => {
      const mention = document.querySelector('[data-mention]');
      expect(mention).not.toBeNull();
      expect(mention).toHaveClass('mention-user');
      expect(mention).toHaveAttribute('data-mention', 'bob');
    });
  });

  describe('the indentation wrapper stays around whichever child is shown', () => {
    it('keeps ms-4 ms-sm-5 mt-2 on the reply-form wrapper both closed and open', () => {
      const { container } = renderReplies();

      const getWrapper = () =>
        container.querySelector('.inline-comment-reply-form');

      expect(getWrapper()).toHaveClass('ms-4', 'ms-sm-5', 'mt-2');

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));

      expect(getWrapper()).toHaveClass('ms-4', 'ms-sm-5', 'mt-2');
    });
  });

  describe('Reply.../Cancel toggle (Requirement 4.1-4.5)', () => {
    it('shows the "Reply..." toggle button with the same wording and appearance as the normal comment\'s reply toggle, and no editor, by default (Requirement 4.1)', () => {
      renderReplies();

      const toggleButton = screen.getByTestId(
        'inline-comment-reply-toggle-button',
      );
      expect(toggleButton).toBeInTheDocument();
      // Same wording as PageComment.tsx's reply toggle: the real
      // translation value ("Reply") plus a literal trailing "...", not a
      // bare "Reply" and not the raw i18n key.
      expect(toggleButton).toHaveTextContent('Reply...');
      // Same appearance: avatar + material-symbols "reply" icon + the
      // shared button classes.
      expect(
        toggleButton.querySelector('[data-testid="user-picture"]'),
      ).not.toBeNull();
      expect(toggleButton).toHaveTextContent('reply');
      expect(toggleButton).toHaveClass(
        'btn',
        'btn-secondary',
        'btn-comment-reply',
      );
      // A distinct testid from PageComment.tsx's own
      // `comment-reply-button` -- these are two separate DOM trees.
      expect(
        screen.queryByTestId('comment-reply-button'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-editor-mock'),
      ).not.toBeInTheDocument();
    });

    it('shows the CommentEditor and hides the toggle button when clicked (Requirement 4.2), wired to this thread', () => {
      renderReplies({
        parentId: 'comment1',
        pageId: 'page1',
        revisionId: 'revision1',
      });

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));

      expect(
        screen.getByTestId('inline-comment-reply-editor-mock'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-toggle-button'),
      ).not.toBeInTheDocument();

      expect(commentEditorProps.current?.pageId).toBe('page1');
      expect(commentEditorProps.current?.revisionId).toBe('revision1');
      expect(commentEditorProps.current?.replyTo).toBe('comment1');
      expect(commentEditorProps.current?.onSubmit).toBeInstanceOf(Function);
      expect(commentEditorProps.current?.onCommented).toBeInstanceOf(Function);
      expect(commentEditorProps.current?.onCanceled).toBeInstanceOf(Function);
    });

    it('returns to the "Reply..." button when the editor\'s onCanceled fires (Requirement 4.3)', () => {
      renderReplies();

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      act(() => {
        (commentEditorProps.current?.onCanceled as () => void)();
      });

      expect(
        screen.getByTestId('inline-comment-reply-toggle-button'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-editor-mock'),
      ).not.toBeInTheDocument();
    });

    it('calls onSubmitReply with the parent id and the typed comment text via the onSubmit override (Requirement 4.5)', async () => {
      const onSubmitReply = vi.fn().mockResolvedValue(undefined);
      renderReplies({ onSubmitReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      await (
        commentEditorProps.current?.onSubmit as (
          comment: string,
        ) => Promise<unknown>
      )('thanks for the note');

      expect(onSubmitReply).toHaveBeenCalledWith(
        'comment1',
        'thanks for the note',
      );
    });

    it('returns to the "Reply..." button when the editor\'s onCommented fires (Requirement 4.4)', () => {
      renderReplies();

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      act(() => {
        (commentEditorProps.current?.onCommented as () => void)();
      });

      expect(
        screen.getByTestId('inline-comment-reply-toggle-button'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-editor-mock'),
      ).not.toBeInTheDocument();
    });
  });

  describe('edit/delete on an already-posted reply (Requirement 18.1, 18.2, 18.5)', () => {
    const ownReply = reply({
      id: 'reply1',
      creatorId: 'user1',
      comment: 'original reply text',
    });

    it("shows the edit and delete buttons when the current user is the reply's own creator", () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      expect(
        screen.getByTestId('inline-comment-reply-edit-button'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('inline-comment-reply-delete-button'),
      ).toBeInTheDocument();
    });

    it("hides the edit and delete buttons when the current user is not the reply's own creator", () => {
      currentUserRef.current = { _id: 'someone-else' };
      renderReplies({ replies: [ownReply] });

      expect(
        screen.queryByTestId('inline-comment-reply-edit-button'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-delete-button'),
      ).not.toBeInTheDocument();
    });

    it('disables the edit/delete controls under the read-only restriction', () => {
      currentUserRef.current = { _id: 'user1' };
      isDisabledRef.current = true;
      renderReplies({ replies: [ownReply] });

      expect(
        screen.getByTestId('not-available-for-read-only-user'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('inline-comment-reply-edit-button'),
      ).toBeDisabled();
      expect(
        screen.getByTestId('inline-comment-reply-delete-button'),
      ).toBeDisabled();
    });

    it('switches to MentionAwareCommentInput with the current text as initialValue and a reply-specific editorKey when the edit button is clicked', () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));

      expect(
        screen.getByTestId('mention-aware-comment-input-mock'),
      ).toBeInTheDocument();
      expect(mentionAwareCommentInputProps.current?.initialValue).toBe(
        'original reply text',
      );
      expect(mentionAwareCommentInputProps.current?.editorKey).toBe(
        'inline_comment_edit_reply1',
      );
    });

    it('calls updateReply(id, text) when the edit form is submitted, and leaves edit mode', async () => {
      const updateReply = vi.fn().mockResolvedValue(undefined);
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply], updateReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));
      await act(async () => {
        await (
          mentionAwareCommentInputProps.current?.onSubmit as (
            text: string,
          ) => Promise<unknown>
        )('the edited reply');
      });

      expect(updateReply).toHaveBeenCalledWith('reply1', 'the edited reply');
      await waitFor(() => {
        expect(
          screen.queryByTestId('mention-aware-comment-input-mock'),
        ).not.toBeInTheDocument();
      });
    });

    it('does NOT call updateReply when the edit is canceled, and reverts to the read-only display', () => {
      const updateReply = vi.fn().mockResolvedValue(undefined);
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply], updateReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));
      expect(
        screen.getByTestId('mention-aware-comment-input-mock'),
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByTestId('inline-comment-reply-edit-cancel-button'),
      );

      expect(updateReply).not.toHaveBeenCalled();
      expect(
        screen.queryByTestId('mention-aware-comment-input-mock'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('inline-comment-reply')).toHaveTextContent(
        'original reply text',
      );
    });

    it('does NOT call removeReply when the delete button is clicked (only opens a confirmation)', () => {
      const removeReply = vi.fn().mockResolvedValue(undefined);
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply], removeReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-delete-button'));

      expect(removeReply).not.toHaveBeenCalled();
      expect(
        screen.getByTestId('inline-comment-reply-delete-confirm'),
      ).toBeInTheDocument();
    });

    it('calls removeReply(id) only after the delete confirmation is confirmed', async () => {
      const removeReply = vi.fn().mockResolvedValue(undefined);
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply], removeReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-delete-button'));
      fireEvent.click(
        screen.getByTestId('inline-comment-reply-delete-confirm-button'),
      );

      await waitFor(() => {
        expect(removeReply).toHaveBeenCalledWith('reply1');
      });
    });

    it('does NOT call removeReply when the delete confirmation is canceled', () => {
      const removeReply = vi.fn().mockResolvedValue(undefined);
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply], removeReply });

      fireEvent.click(screen.getByTestId('inline-comment-reply-delete-button'));
      fireEvent.click(
        screen.getByTestId('inline-comment-reply-delete-cancel-button'),
      );

      expect(removeReply).not.toHaveBeenCalled();
      expect(
        screen.queryByTestId('inline-comment-reply-delete-confirm'),
      ).not.toBeInTheDocument();
    });
  });
});
