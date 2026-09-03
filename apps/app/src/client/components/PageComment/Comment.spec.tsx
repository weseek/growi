/**
 * Baseline regression test for the normal comment list item's DOM structure.
 *
 * This file pins the current output of `Comment.tsx` BEFORE it gets rewritten
 * to use the shared `CommentCard` component (a later task in this spec). It
 * exists to prove Req 13.9 ("the normal comment's list item appearance must
 * not change") across that rewrite.
 *
 * Per design.md's Testing Strategy, a text-content assertion would still pass
 * even if the DOM were rebuilt into a different shape, so this test instead
 * walks the container chain as DOM structure: the outermost `comment-styles`
 * CSS-module class, containing `.page-comment`, containing
 * `.page-comment-main.bg-comment.rounded`, containing a header row
 * (`.d-flex.align-items-center`) and `.page-comment-body`.
 */

import type { JSX, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ICommentHasId } from '../../../interfaces/comment';

// ---------------------------------------------------------------------------
// Module mocks
//
// These stub out heavy/irrelevant subtrees (markdown rendering, the CodeMirror
// -based re-edit editor, tooltips) so the test can focus on the container
// chain that Req 13.9 cares about, without depending on their internals.
// ---------------------------------------------------------------------------

vi.mock('./Comment.module.scss', () => ({
  default: { 'comment-styles': 'comment-styles' },
}));

vi.mock('@growi/ui/dist/components', () => ({
  UserPicture: () => <span data-testid="user-picture" />,
}));

vi.mock('../../../components/PageView/RevisionRenderer', () => ({
  default: ({ markdown }: { markdown: string }) => (
    <div data-testid="revision-renderer">{markdown}</div>
  ),
}));

vi.mock('./CommentControl', () => ({
  CommentControl: () => <div data-testid="comment-control" />,
}));

vi.mock('./CommentEditor', () => ({
  CommentEditor: () => <div data-testid="comment-editor" />,
}));

vi.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('reactstrap', () => ({
  UncontrolledTooltip: () => null,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    id,
    className,
  }: {
    href: string;
    children: ReactNode;
    id?: string;
    className?: string;
  }): JSX.Element => (
    <a href={href} id={id} className={className}>
      {children}
    </a>
  ),
}));

import { Comment } from './Comment';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const creator = {
  _id: 'user1',
  __v: 0,
  name: 'Alice',
  username: 'alice',
  email: 'alice@example.com',
  isEmailPublished: true,
};

const baseComment = {
  _id: 'comment1',
  __v: 0,
  page: 'page1',
  creator,
  revision: 'revision1',
  comment: 'hello world',
  commentPosition: 0,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
} as unknown as ICommentHasId;

const noop = () => {
  /* noop */
};

const renderComment = (comment: ICommentHasId = baseComment) =>
  render(
    <Comment
      comment={comment}
      // biome-ignore lint/suspicious/noExplicitAny: rendererOptions is unused because RevisionRenderer is mocked
      rendererOptions={{} as any}
      revisionId="revision1"
      revisionCreatedAt={new Date('2024-01-01T00:00:00.000Z')}
      // biome-ignore lint/suspicious/noExplicitAny: currentUser only needs a username for this test
      currentUser={{ username: 'someone-else' } as any}
      isReadOnly={true}
      pageId="page1"
      pagePath="/path/to/page"
      deleteBtnClicked={noop}
      onComment={noop}
    />,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Comment — normal comment list item DOM structure (Req 13.9 baseline)', () => {
  it('nests comment-styles > .page-comment > .page-comment-main.bg-comment.rounded', () => {
    const { container } = renderComment();

    const commentStylesRoot = container.querySelector('.comment-styles');
    expect(commentStylesRoot).not.toBeNull();

    const pageComment = commentStylesRoot?.querySelector(
      '#comment1.page-comment',
    );
    expect(pageComment).not.toBeNull();
    // .page-comment must be a direct child of the comment-styles container.
    expect(pageComment?.parentElement).toBe(commentStylesRoot);

    const main = pageComment?.querySelector(
      '.page-comment-main.bg-comment.rounded',
    );
    expect(main).not.toBeNull();
    // .page-comment-main must be a direct child of .page-comment.
    expect(main?.parentElement).toBe(pageComment);
  });

  it('the comment-main box directly contains a header row and the comment body', () => {
    const { container } = renderComment();

    const main = container.querySelector(
      '.comment-styles .page-comment .page-comment-main.bg-comment.rounded',
    );
    expect(main).not.toBeNull();

    const header = main?.querySelector('.d-flex.align-items-center');
    expect(header).not.toBeNull();
    expect(header?.parentElement).toBe(main);

    const body = main?.querySelector('.page-comment-body');
    expect(body).not.toBeNull();
    expect(body?.parentElement).toBe(main);

    // The header row must precede the body, as in the current DOM order.
    const children = Array.from(main?.children ?? []);
    expect(children.indexOf(header as Element)).toBeLessThan(
      children.indexOf(body as Element),
    );
  });

  it('the header row contains the user picture, username, and the posted-date link', () => {
    const { container } = renderComment();

    const header = container.querySelector(
      '.comment-styles .page-comment .page-comment-main .d-flex.align-items-center',
    );
    expect(header).not.toBeNull();
    expect(
      header?.querySelector('[data-testid="user-picture"]'),
    ).not.toBeNull();
    expect(
      header?.querySelector(`a[href="#${baseComment._id}"]`),
    ).not.toBeNull();
  });

  it('the comment body wraps the rendered markdown content', () => {
    const { container } = renderComment();

    const body = container.querySelector(
      '.comment-styles .page-comment .page-comment-main .page-comment-body',
    );
    expect(body).not.toBeNull();
    expect(
      body?.querySelector('[data-testid="revision-renderer"]'),
    ).not.toBeNull();
  });
});
