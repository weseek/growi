// @vitest-environment happy-dom

/**
 * Unit tests for task 3.3: combining the hit-test hook (3.1) with the
 * preview popover (3.2) and wiring their open/close policy (design.md 決定2,
 * requirements.md Requirement 2, ACs 2.1-2.6).
 *
 * `useHighlightHitTest` and `rangesById` are both mocked -- their own
 * behavior is covered by their own specs (3.1, resolved-range.spec.ts). This
 * file only verifies the policy this component itself owns: which comment id
 * (if any) gets a popover, and the click-pinning behavior documented in
 * tasks.md's Implementation Notes (a click-opened popover must survive the
 * hook's hit clearing back to `null` once the pointer leaves the highlight).
 *
 * `InlineCommentPreviewPopover` is mocked to a minimal stand-in exposing the
 * props it was given plus a close button -- its own rendering/positioning/
 * reply-submission behavior is task 3.2's concern, not this one's.
 */

import type { RefObject } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RendererOptions } from '~/interfaces/renderer-options';

import type {
  InlineCommentWithReplies,
  ResolvedRange,
} from '../../../interfaces';
import type { HighlightHit, HitTestTarget } from './use-highlight-hit-test';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockedUseHighlightHitTest = vi.fn<() => HighlightHit | null>(() => null);
vi.mock('./use-highlight-hit-test', () => ({
  useHighlightHitTest: () => mockedUseHighlightHitTest(),
}));

const mockedRangesById =
  vi.fn<
    (
      container: HTMLElement,
      resolvedRanges: ReadonlyMap<string, ResolvedRange>,
    ) => ReadonlyMap<string, HitTestTarget>
  >();
vi.mock('../../services/resolved-range', () => ({
  rangesById: (
    container: HTMLElement,
    resolvedRanges: ReadonlyMap<string, ResolvedRange>,
  ) => mockedRangesById(container, resolvedRanges),
}));

type PreviewPopoverProps = {
  comment: InlineCommentWithReplies;
  range: unknown;
  rendererOptions: RendererOptions | undefined;
  createReply: (parentId: string, comment: string) => Promise<unknown>;
  onClose: () => void;
};
const previewPopoverSpy = vi.fn<(props: PreviewPopoverProps) => void>();
vi.mock('./InlineCommentPreviewPopover', () => ({
  InlineCommentPreviewPopover: (props: PreviewPopoverProps) => {
    previewPopoverSpy(props);
    return (
      <div data-testid="preview-popover">
        <span data-testid="preview-popover-comment-id">{props.comment.id}</span>
        <button type="button" onClick={props.onClose}>
          close
        </button>
      </div>
    );
  },
}));

import { InlineCommentBodyInteraction } from './InlineCommentBodyInteraction';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const buildComment = (
  overrides: Partial<InlineCommentWithReplies> = {},
): InlineCommentWithReplies => ({
  id: 'comment1',
  pageId: 'page1',
  creatorId: 'user1',
  creator: null,
  comment: 'the comment body',
  anchorOriginRevisionId: 'revision1',
  anchor: { quote: 'q', prefix: '', suffix: '', approxOffset: 0 },
  resolvedById: null,
  resolvedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  replies: [],
  ...overrides,
});

const rendererOptions: RendererOptions = {
  remarkPlugins: [],
  rehypePlugins: [],
  components: {},
};

// A minimal structural stand-in -- this component never inspects any Range
// members beyond what `HitTestTarget` declares (the actual hit-testing
// happens inside `useHighlightHitTest`, mocked away above), so a real `Range`
// is unnecessary here.
const buildRangeFixture = (): HitTestTarget => ({
  getClientRects: () => [] as unknown as DOMRectList,
});

const renderInteraction = (
  overrides: Partial<{
    inlineComments: InlineCommentWithReplies[];
    resolvedRanges: ReadonlyMap<string, ResolvedRange>;
    createReply: (parentId: string, comment: string) => Promise<unknown>;
  }> = {},
) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const containerRef: RefObject<HTMLElement | null> = { current: container };

  return render(
    <InlineCommentBodyInteraction
      containerRef={containerRef}
      resolvedRanges={overrides.resolvedRanges ?? new Map()}
      inlineComments={overrides.inlineComments ?? [buildComment()]}
      createReply={
        overrides.createReply ?? vi.fn().mockResolvedValue(undefined)
      }
      rendererOptions={rendererOptions}
    />,
  );
};

describe('InlineCommentBodyInteraction', () => {
  beforeEach(() => {
    mockedUseHighlightHitTest.mockReturnValue(null);
    previewPopoverSpy.mockClear();
    mockedRangesById.mockReturnValue(
      new Map<string, HitTestTarget>([
        ['comment1', buildRangeFixture()],
        ['comment2', buildRangeFixture()],
      ]),
    );
  });

  it('renders no popover when there is no hit', () => {
    renderInteraction();

    expect(screen.queryByTestId('preview-popover')).not.toBeInTheDocument();
  });

  it('opens the popover for a hover hit on a desktop-width highlight (Req 2.1)', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'hover',
    });

    renderInteraction();

    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );
  });

  it('updates the shown popover as the hover hit moves to a different highlight', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'hover',
    });
    const { rerender } = renderInteraction({
      inlineComments: [
        buildComment({ id: 'comment1' }),
        buildComment({ id: 'comment2' }),
      ],
    });
    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );

    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment2',
      source: 'hover',
    });
    rerender(
      <InlineCommentBodyInteraction
        containerRef={{ current: document.body }}
        resolvedRanges={new Map()}
        inlineComments={[
          buildComment({ id: 'comment1' }),
          buildComment({ id: 'comment2' }),
        ]}
        createReply={vi.fn().mockResolvedValue(undefined)}
        rendererOptions={rendererOptions}
      />,
    );

    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment2',
    );
  });

  it('closes the popover once the hover hit clears (no pinning for hover)', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'hover',
    });
    const { rerender } = renderInteraction();
    expect(screen.getByTestId('preview-popover')).toBeInTheDocument();

    mockedUseHighlightHitTest.mockReturnValue(null);
    rerender(
      <InlineCommentBodyInteraction
        containerRef={{ current: document.body }}
        resolvedRanges={new Map()}
        inlineComments={[buildComment()]}
        createReply={vi.fn().mockResolvedValue(undefined)}
        rendererOptions={rendererOptions}
      />,
    );

    expect(screen.queryByTestId('preview-popover')).not.toBeInTheDocument();
  });

  it('opens the popover for a click hit (tap on tablet-and-below width) (Req 2.2)', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });

    renderInteraction();

    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );
  });

  it('pins a click-opened popover so it survives the hook clearing back to null', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });
    const { rerender } = renderInteraction();
    expect(screen.getByTestId('preview-popover')).toBeInTheDocument();

    // The hook itself does not latch a click id -- once the pointer moves off
    // the highlight, its next pointermove reports null. Pinning must keep the
    // popover open regardless.
    mockedUseHighlightHitTest.mockReturnValue(null);
    rerender(
      <InlineCommentBodyInteraction
        containerRef={{ current: document.body }}
        resolvedRanges={new Map()}
        inlineComments={[buildComment()]}
        createReply={vi.fn().mockResolvedValue(undefined)}
        rendererOptions={rendererOptions}
      />,
    );

    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );
  });

  it('ignores a hover hit elsewhere while a click-pinned popover is open', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });
    const { rerender } = renderInteraction({
      inlineComments: [
        buildComment({ id: 'comment1' }),
        buildComment({ id: 'comment2' }),
      ],
    });
    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );

    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment2',
      source: 'hover',
    });
    rerender(
      <InlineCommentBodyInteraction
        containerRef={{ current: document.body }}
        resolvedRanges={new Map()}
        inlineComments={[
          buildComment({ id: 'comment1' }),
          buildComment({ id: 'comment2' }),
        ]}
        createReply={vi.fn().mockResolvedValue(undefined)}
        rendererOptions={rendererOptions}
      />,
    );

    // Still pinned to comment1 -- the hover elsewhere on comment2 is ignored.
    expect(screen.getByTestId('preview-popover-comment-id')).toHaveTextContent(
      'comment1',
    );
  });

  it("closes the popover via the popover's own close mechanism (Req 2.4)", () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });
    renderInteraction();
    expect(screen.getByTestId('preview-popover')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(screen.queryByTestId('preview-popover')).not.toBeInTheDocument();
  });

  it('offers no popover when the hit comment id cannot be found in the inline comments list (Req 2.6 defensive guard)', () => {
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'missing-comment',
      source: 'click',
    });

    renderInteraction({ inlineComments: [buildComment({ id: 'comment1' })] });

    expect(screen.queryByTestId('preview-popover')).not.toBeInTheDocument();
  });

  it('offers no popover when the hit id has no resolvable Range (Req 2.6)', () => {
    mockedRangesById.mockReturnValue(new Map());
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });

    renderInteraction();

    expect(screen.queryByTestId('preview-popover')).not.toBeInTheDocument();
  });

  it('forwards createReply and rendererOptions through to the popover', () => {
    const createReply = vi.fn().mockResolvedValue(undefined);
    mockedUseHighlightHitTest.mockReturnValue({
      commentId: 'comment1',
      source: 'click',
    });

    renderInteraction({ createReply });

    expect(previewPopoverSpy).toHaveBeenCalledWith(
      expect.objectContaining({ createReply, rendererOptions }),
    );
  });
});
