// @vitest-environment happy-dom

import { useEffect } from 'react';
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

// `InlineCommentReplyItem` reuses `InlineCommentItem.module.scss`'s
// `.icon-button-container` hover-visibility rule and `.icon-button` sizing
// rule via import, not by duplicating new rules -- see
// InlineCommentReplies.tsx's top-of-file comment. Both are CSS-Modules-scoped
// local classes (no `:global()`); this identity mock mirrors
// InlineCommentItem.spec.tsx's own mock so assertions can match on the plain
// string.
vi.mock('./InlineCommentItem.module.scss', () => ({
  default: {
    'icon-button-container': 'icon-button-container',
    'icon-button': 'icon-button',
  },
}));

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
/**
 * The input hands `{ canSubmit, submit, insertMention }` outward through
 * `onControlsChange` and each caller renders the submit button itself, so the
 * mock reproduces that handshake (from an effect, never during render).
 */
const commentInputControls = vi.hoisted(() => ({
  canSubmit: true,
  submit: vi.fn(),
  insertMention: vi.fn(),
}));
vi.mock('../MentionAwareCommentInput/MentionAwareCommentInput', () => ({
  MentionAwareCommentInput: (props: Record<string, unknown>) => {
    mentionAwareCommentInputProps.current = props;
    const onControlsChange = props.onControlsChange as
      | ((controls: unknown) => void)
      | undefined;
    useEffect(() => {
      onControlsChange?.({
        canSubmit: commentInputControls.canSubmit,
        submit: commentInputControls.submit,
        insertMention: commentInputControls.insertMention,
      });
    }, [onControlsChange]);
    return <div data-testid="mention-aware-comment-input-mock" />;
  },
}));

vi.mock('../InlineCommentForm/MentionPickerButton', () => ({
  MentionPickerButton: (props: { onInsert: (username: string) => void }) => (
    <button
      type="button"
      data-testid="mention-picker-button-mock"
      onClick={() => props.onInsert('alice')}
    >
      @
    </button>
  ),
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
    commentInputControls.canSubmit = true;
    commentInputControls.submit.mockReset();
    commentInputControls.insertMention.mockReset();
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

    it("renders the edit/delete buttons as icon buttons (material-symbols glyphs, no text-link wording) matching InlineCommentItem's pattern (Requirement 3.5)", () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      const editButton = screen.getByTestId('inline-comment-reply-edit-button');
      const deleteButton = screen.getByTestId(
        'inline-comment-reply-delete-button',
      );

      expect(editButton).toHaveClass(
        'btn',
        'btn-link',
        'opacity-50',
        'rounded-circle',
        'icon-button',
      );
      expect(deleteButton).toHaveClass(
        'btn',
        'btn-link',
        'opacity-50',
        'text-danger',
        'rounded-circle',
        'icon-button',
      );
      expect(
        editButton.querySelector('.material-symbols-outlined'),
      ).toHaveTextContent('edit');
      expect(
        deleteButton.querySelector('.material-symbols-outlined'),
      ).toHaveTextContent('delete');
      // No more always-visible text-link wording left behind (previous
      // footer implementation rendered the raw "Edit"/"Delete" i18n keys).
      expect(editButton).not.toHaveTextContent('Edit');
      expect(deleteButton).not.toHaveTextContent('Delete');
    });

    it('places the edit/delete icon buttons in the header row (headerEnd), not the footer (DOM structure)', () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      const replyContainer = screen.getByTestId('inline-comment-reply');
      const header = replyContainer.querySelector('.d-flex.align-items-center');
      const editButton = screen.getByTestId('inline-comment-reply-edit-button');
      const deleteButton = screen.getByTestId(
        'inline-comment-reply-delete-button',
      );

      expect(header).not.toBeNull();
      expect(header?.contains(editButton)).toBe(true);
      expect(header?.contains(deleteButton)).toBe(true);
    });

    it('gives the icon-button container the same hover-visibility CSS Modules class InlineCommentItem uses (reused, not duplicated)', () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      const editButton = screen.getByTestId('inline-comment-reply-edit-button');
      const iconButtonContainer = editButton.closest('.icon-button-container');

      expect(iconButtonContainer).not.toBeNull();
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

    // The reply edit mode's layout is out of this spec's visual scope: the
    // submit button stays where it always was — inline to the right of the
    // editor, same testid — even though the input component no longer
    // renders it. Cancel stays on its own row below, untouched.
    it('renders the submit button inline to the right of the editor, keeping its original testid', () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));

      const submitButton = screen.getByTestId('inline-comment-submit-button');
      const input = screen.getByTestId('mention-aware-comment-input-mock');
      // Same row: the editor and the button group share one flex row, so the
      // button is not a descendant of the editor's own wrapper.
      const row = submitButton.parentElement?.parentElement as HTMLElement;
      expect(row).toHaveClass('d-flex', 'align-items-start', 'gap-2');
      expect(row.contains(input)).toBe(true);
      expect(submitButton).toHaveClass('btn', 'btn-sm', 'btn-primary');
      expect(submitButton).toHaveAttribute(
        'aria-label',
        'page_comment.comment',
      );
      // Cancel still sits on its own row below, unchanged.
      const cancelButton = screen.getByTestId(
        'inline-comment-reply-edit-cancel-button',
      );
      expect(row.contains(cancelButton)).toBe(false);
    });

    it("invokes the input's submit control when the submit button is clicked", () => {
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));
      fireEvent.click(screen.getByTestId('inline-comment-submit-button'));

      expect(commentInputControls.submit).toHaveBeenCalledTimes(1);
    });

    it('disables the submit button while the input reports it cannot submit', () => {
      commentInputControls.canSubmit = false;
      currentUserRef.current = { _id: 'user1' };
      renderReplies({ replies: [ownReply] });

      fireEvent.click(screen.getByTestId('inline-comment-reply-edit-button'));

      expect(screen.getByTestId('inline-comment-submit-button')).toBeDisabled();
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
