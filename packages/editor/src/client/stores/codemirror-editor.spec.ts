import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UseCodeMirrorEditor } from '../services/index.js';

const useCodeMirrorEditorMock = vi.fn();

vi.mock('../services/index.js', () => ({
  useCodeMirrorEditor: (...args: unknown[]) => useCodeMirrorEditorMock(...args),
}));

const { useCodeMirrorEditorIsolated } = await import('./codemirror-editor.js');

/**
 * Builds a UseCodeMirrorEditor-shaped value. `state` / `view` are undefined
 * until @uiw/react-codemirror finishes its own (state-backed, therefore
 * asynchronous) initialization, which is exactly the window this spec covers.
 */
const buildEditor = (
  overrides: Partial<UseCodeMirrorEditor> = {},
): UseCodeMirrorEditor =>
  ({
    state: undefined,
    view: undefined,
    initDoc: vi.fn(),
    appendExtensions: vi.fn(),
    getDoc: vi.fn(),
    getDocString: vi.fn(),
    focus: vi.fn(),
    setCaretLine: vi.fn(),
    insertText: vi.fn(),
    replaceText: vi.fn(),
    insertMarkdownElements: vi.fn(),
    insertPrefix: vi.fn(),
    foldDrawio: vi.fn(),
    ...overrides,
  }) as unknown as UseCodeMirrorEditor;

let keySeq = 0;
const nextKey = () => `codemirror-editor-spec-${keySeq++}`;

describe('useCodeMirrorEditorIsolated', () => {
  beforeEach(() => {
    useCodeMirrorEditorMock.mockReset();
  });

  it('does not expose an editor whose view/state are not ready yet', () => {
    const incomplete = buildEditor();
    useCodeMirrorEditorMock.mockReturnValue(incomplete);

    const container = document.createElement('div');
    const key = nextKey();
    const { result } = renderHook(() =>
      useCodeMirrorEditorIsolated(key, container),
    );

    expect(result.current.data).toBeUndefined();
  });

  it('exposes the editor once view/state have been initialized', () => {
    const incomplete = buildEditor();
    const complete = buildEditor({
      state: { doc: 'ready' } as unknown as UseCodeMirrorEditor['state'],
      view: { docView: {} } as unknown as UseCodeMirrorEditor['view'],
    });
    useCodeMirrorEditorMock.mockReturnValue(incomplete);

    const container = document.createElement('div');
    const key = nextKey();
    const { result, rerender } = renderHook(() =>
      useCodeMirrorEditorIsolated(key, container),
    );

    expect(result.current.data).toBeUndefined();

    // @uiw/react-codemirror keeps view/state in useState, so completing
    // initialization re-renders the consumer with a valid value.
    useCodeMirrorEditorMock.mockReturnValue(complete);
    rerender();

    expect(result.current.data).toBe(complete);
  });

  it('keeps exposing the initialized editor on subsequent renders', () => {
    const complete = buildEditor({
      state: { doc: 'ready' } as unknown as UseCodeMirrorEditor['state'],
      view: { docView: {} } as unknown as UseCodeMirrorEditor['view'],
    });
    useCodeMirrorEditorMock.mockReturnValue(complete);

    const container = document.createElement('div');
    const key = nextKey();
    const { result, rerender } = renderHook(() =>
      useCodeMirrorEditorIsolated(key, container),
    );

    expect(result.current.data).toBe(complete);

    rerender();

    expect(result.current.data).toBe(complete);
  });

  it('exposes nothing while the container has not been attached', () => {
    const complete = buildEditor({
      state: { doc: 'ready' } as unknown as UseCodeMirrorEditor['state'],
      view: { docView: {} } as unknown as UseCodeMirrorEditor['view'],
    });
    useCodeMirrorEditorMock.mockReturnValue(complete);

    const key = nextKey();
    const { result } = renderHook(() => useCodeMirrorEditorIsolated(key, null));

    expect(result.current.data).toBeUndefined();
  });
});
