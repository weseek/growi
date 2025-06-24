import { Text } from '@codemirror/state';
import type { UseCodeMirrorEditor } from '@growi/editor/dist/client/services/use-codemirror-editor';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import { getPageBodyForContext } from './get-page-body-for-context';

describe('getPageBodyForContext', () => {
  let mockEditor: DeepMockProxy<UseCodeMirrorEditor>;

  // Helper function to create identifiable content where each character shows its position
  const createPositionalContent = (length: number): string => {
    return Array.from({ length }, (_, i) => (i % 10).toString()).join('');
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = mockDeep<UseCodeMirrorEditor>();
  });

  it('should return undefined when editor is undefined', () => {
    const result = getPageBodyForContext(undefined, 10, 10);
    expect(result).toBeUndefined();
  });

  it('should return getDocString when document is short', () => {
    // Create a real Text instance with short content
    const shortText = 'short';
    const realDoc = Text.of([shortText]); // length: 5, shorter than maxTotalLength of 20

    mockEditor.getDoc.mockReturnValue(realDoc);
    mockEditor.getDocString.mockReturnValue(shortText);

    const result = getPageBodyForContext(mockEditor, 10, 10);

    expect(result).toBe(shortText);
    expect(mockEditor.getDocString).toHaveBeenCalled();
  });

  it('should extract text around cursor when document is long', () => {
    // Create a real Text instance with identifiable content (each character shows its position)
    const longContent = createPositionalContent(1000);
    // Content: "0123456789012345678901234567890123456789..." (position-based)
    const realDoc = Text.of([longContent]); // length: 1000, longer than maxTotalLength of 300

    mockEditor.getDoc.mockReturnValue(realDoc);

    // Mock view with cursor at position 500
    if (mockEditor.view?.state?.selection?.main) {
      Object.defineProperty(mockEditor.view.state.selection.main, 'head', { value: 500 });
    }

    const result = getPageBodyForContext(mockEditor, 100, 200);

    // Expected: slice(400, 700) should extract characters from position 400 to 699
    // Position 400: '0' (400 % 10), Position 699: '9' (699 % 10)
    const expectedContent = longContent.slice(400, 700);
    expect(result).toBe(expectedContent);
    expect(result).toHaveLength(300); // 700 - 400 = 300
    expect(result).toBeDefined();
    if (result) {
      expect(result[0]).toBe('0'); // First character at position 400
      expect(result[299]).toBe('9'); // Last character at position 699
    }
  });
});
