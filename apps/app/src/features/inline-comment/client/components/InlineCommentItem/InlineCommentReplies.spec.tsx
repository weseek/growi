// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
// The reply-composition input is now the shared `MentionAwareCommentInput`
// (task 5.1), which itself follows CommentEditor.tsx's mention-aware textarea
// pattern (CodeMirrorEditorComment + useCodeMirrorEditorIsolated + mention
// extensions). This file mocks at the SAME boundary
// InlineCommentForm.spec.tsx / MentionAwareCommentInput.spec.tsx already
// established -- CodeMirrorEditorComment down -- rather than mocking
// MentionAwareCommentInput as a whole, so the observable contract under test
// stays "clicking Reply... opens the shared input, Cancel closes it, submit
// calls onSubmitReply", without re-testing MentionAwareCommentInput's own
// internals (already covered by its own spec).
// ---------------------------------------------------------------------------

const editorState = vi.hoisted(() => ({ docText: '' }));

const codeMirrorEditorMock = vi.hoisted(() => ({
  getDocString: vi.fn(() => editorState.docText),
  initDoc: vi.fn(),
  appendExtensions: vi.fn(() => vi.fn()),
  insertText: vi.fn(),
}));

vi.mock('@growi/editor', () => ({
  useSetResolvedTheme: () => vi.fn(),
}));

vi.mock('@growi/editor/dist/client/components/CodeMirrorEditorComment', () => ({
  CodeMirrorEditorComment: (props: {
    cmProps?: { onChange?: (value: string) => void };
  }) => (
    // eslint-disable-next-line jsx-a11y/no-onchange
    <textarea
      data-testid="inline-comment-reply-textarea"
      onChange={(e) => {
        editorState.docText = e.target.value;
        props.cmProps?.onChange?.(e.target.value);
      }}
    />
  ),
}));

const createMentionCompletionExtension = vi.hoisted(() => vi.fn(() => ({})));
vi.mock('@growi/editor/dist/client/services', () => ({
  createMentionCompletionExtension,
  mentionDecorationSettings: {},
}));

vi.mock('@growi/editor/dist/client/stores/codemirror-editor', () => ({
  useCodeMirrorEditorIsolated: () => ({ data: codeMirrorEditorMock }),
}));

vi.mock('~/stores-universal/use-next-themes', () => ({
  useNextThemes: () => ({ resolvedTheme: 'light' }),
}));

// fetchMentionUsers is the shared service extracted in task 1.4.
const fetchMentionUsersMock = vi.hoisted(() => vi.fn());
vi.mock('../../services/fetch-mention-users', () => ({
  fetchMentionUsers: fetchMentionUsersMock,
}));

// MentionPickerButton is mocked at the module boundary, same as
// MentionAwareCommentInput.spec.tsx -- its own dropdown/fetch behavior is
// already covered there.
vi.mock('../InlineCommentForm/MentionPickerButton', () => ({
  MentionPickerButton: () => (
    <button type="button" data-testid="mention-picker-button-mock">
      @
    </button>
  ),
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
  comment: 'a reply',
  replyToId: 'comment1',
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  ...overrides,
});

describe('InlineCommentReplies', () => {
  beforeEach(() => {
    editorState.docText = '';
  });

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

  describe('Reply.../Cancel toggle (Requirement 4.1-4.5)', () => {
    it('shows the "Reply..." toggle button with the same wording and appearance as the normal comment\'s reply toggle, and no input, by default (Requirement 4.1)', () => {
      render(
        <InlineCommentReplies
          parentId="comment1"
          replies={[]}
          rendererOptions={buildMentionAwareRendererOptions()}
          onSubmitReply={vi.fn()}
        />,
      );

      const toggleButton = screen.getByTestId(
        'inline-comment-reply-toggle-button',
      );
      expect(toggleButton).toBeInTheDocument();
      // Same wording as PageComment.tsx's reply toggle: the real
      // translation value ("Reply") plus a literal trailing "...", not a
      // bare "Reply" and not the raw i18n key. Catches a regression that
      // drops the "..." suffix (the finding this remediation round fixes).
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
        screen.queryByTestId('inline-comment-reply-textarea'),
      ).not.toBeInTheDocument();
    });

    it('shows the mention-aware input and hides the toggle button when clicked (Requirement 4.2)', () => {
      render(
        <InlineCommentReplies
          parentId="comment1"
          replies={[]}
          rendererOptions={buildMentionAwareRendererOptions()}
          onSubmitReply={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));

      expect(
        screen.getByTestId('inline-comment-reply-textarea'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-toggle-button'),
      ).not.toBeInTheDocument();
    });

    it('returns to the "Reply..." button when Cancel is clicked (Requirement 4.3)', () => {
      render(
        <InlineCommentReplies
          parentId="comment1"
          replies={[]}
          rendererOptions={buildMentionAwareRendererOptions()}
          onSubmitReply={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.getByTestId('inline-comment-reply-toggle-button'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('inline-comment-reply-textarea'),
      ).not.toBeInTheDocument();
    });

    it('calls onSubmitReply with the parent id and typed comment text on submit, unchanged from before (Requirement 4.5)', async () => {
      const onSubmitReply = vi.fn().mockResolvedValue(undefined);
      render(
        <InlineCommentReplies
          parentId="comment1"
          replies={[]}
          rendererOptions={buildMentionAwareRendererOptions()}
          onSubmitReply={onSubmitReply}
        />,
      );

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      fireEvent.change(screen.getByTestId('inline-comment-reply-textarea'), {
        target: { value: 'thanks for the note' },
      });
      fireEvent.click(screen.getByTestId('inline-comment-submit-button'));

      await waitFor(() => {
        expect(onSubmitReply).toHaveBeenCalledWith(
          'comment1',
          'thanks for the note',
        );
      });
    });

    it('returns to the "Reply..." button after a successful submit (Requirement 4.4)', async () => {
      const onSubmitReply = vi.fn().mockResolvedValue(undefined);
      render(
        <InlineCommentReplies
          parentId="comment1"
          replies={[]}
          rendererOptions={buildMentionAwareRendererOptions()}
          onSubmitReply={onSubmitReply}
        />,
      );

      fireEvent.click(screen.getByTestId('inline-comment-reply-toggle-button'));
      fireEvent.change(screen.getByTestId('inline-comment-reply-textarea'), {
        target: { value: 'thanks for the note' },
      });
      fireEvent.click(screen.getByTestId('inline-comment-submit-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('inline-comment-reply-toggle-button'),
        ).toBeInTheDocument();
      });
    });
  });
});
