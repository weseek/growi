/**
 * Regression guard for the page-bottom comment editor.
 *
 * The inline-comment work exposed `hideToolbar` on `CodeMirrorEditorProps` and
 * passes it (plus a `basicSetup` override that removes the line-number and fold
 * gutters) from `InlineCommentForm`. This file pins the fact that the *normal*
 * comment editor did not opt into either: it must keep its toolbar and its
 * default gutters, so the type change stays invisible here.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommentEditor } from './CommentEditor';

const editorProps = vi.hoisted(
  () => ({ current: undefined }) as { current?: Record<string, unknown> },
);

vi.mock('@growi/editor', () => ({
  GlobalCodeMirrorEditorKey: { COMMENT_NEW: 'comment_new' },
  useSetResolvedTheme: () => vi.fn(),
}));

vi.mock('@growi/editor/dist/client/components/CodeMirrorEditorComment', () => ({
  CodeMirrorEditorComment: (props: Record<string, unknown>) => {
    editorProps.current = props;
    return <div data-testid="comment-editor-codemirror" />;
  },
}));

vi.mock('@growi/editor/dist/client/services', () => ({
  createMentionCompletionExtension: vi.fn(() => ({})),
  mentionDecorationSettings: {},
}));

vi.mock('@growi/editor/dist/client/stores/codemirror-editor', () => ({
  useCodeMirrorEditorIsolated: () => ({
    data: {
      getDocString: vi.fn(() => ''),
      initDoc: vi.fn(),
      appendExtensions: vi.fn(() => vi.fn()),
      focus: vi.fn(),
    },
  }),
}));

vi.mock('@growi/ui/dist/components', () => ({
  UserPicture: () => <span data-testid="user-picture" />,
}));

vi.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('~/client/services/upload-attachments', () => ({
  uploadAttachments: vi.fn(),
}));
vi.mock('~/client/util/apiv3-client', () => ({ apiv3Get: vi.fn() }));
vi.mock('~/client/util/toastr', () => ({ toastError: vi.fn() }));

vi.mock('~/states/global', () => ({ useCurrentUser: () => undefined }));
vi.mock('~/states/page', () => ({ useCurrentPagePath: () => '/foo' }));
vi.mock('~/states/server-configurations', () => ({
  isSlackConfiguredAtom: { debugLabel: 'isSlackConfigured' },
  useAcceptedUploadFileType: () => undefined,
}));
vi.mock('~/states/ui/editor', () => ({
  useIsSlackEnabled: () => [false, vi.fn()],
}));
vi.mock('~/states/ui/unsaved-warning', () => ({
  useCommentEditorsDirtyMap: () => ({ markDirty: vi.fn(), markClean: vi.fn() }),
}));
vi.mock('~/stores/comment', () => ({
  useSWRxPageComment: () => ({ update: vi.fn(), post: vi.fn() }),
}));
vi.mock('~/stores/editor', () => ({
  useEditorSettings: () => ({ data: undefined }),
  useSWRxSlackChannels: () => ({ data: undefined }),
}));
vi.mock('~/stores-universal/use-next-themes', () => ({
  useNextThemes: () => ({ resolvedTheme: 'light' }),
}));

vi.mock('jotai', () => ({ useAtomValue: () => false }));

vi.mock('../NotAvailableForGuest', () => ({
  NotAvailableForGuest: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock('../NotAvailableForReadOnlyUser', () => ({
  NotAvailableIfReadOnlyUserNotAllowedToComment: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));
vi.mock('./CommentPreview', () => ({
  CommentPreview: () => <div data-testid="comment-preview" />,
}));

describe('CommentEditor', () => {
  beforeEach(() => {
    editorProps.current = undefined;
  });

  const renderEditor = () =>
    render(<CommentEditor pageId="page-1" revisionId="rev-1" />);

  it('renders the CodeMirror comment editor', () => {
    renderEditor();

    expect(screen.getByTestId('comment-editor-codemirror')).toBeInTheDocument();
  });

  it('keeps the editor toolbar and the default gutters — it opts into neither hideToolbar nor a basicSetup override', () => {
    renderEditor();

    expect(editorProps.current?.hideToolbar).toBeUndefined();
    expect(editorProps.current?.cmProps).not.toHaveProperty('basicSetup');
  });
});
