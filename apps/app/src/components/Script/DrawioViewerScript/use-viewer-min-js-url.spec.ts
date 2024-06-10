import { useViewerMinJsUrl } from './use-viewer-min-js-url';

const mocks = vi.hoisted(() => {
  return {
    useRendererConfigMock: vi.fn(),
  };
});

vi.mock('~/stores/context', () => ({
  useRendererConfig: mocks.useRendererConfigMock,
}));

describe('useViewerMinJsUrl', () => {
  it('should return the URL when rendererConfig is undefined', () => {
    // Arrange
    mocks.useRendererConfigMock.mockImplementation(() => {
      return { data: undefined };
    });

    // Act
    const url = useViewerMinJsUrl();

    // Assert
    expect(url).toBe('http://localhost/js/viewer.min.js');
  });

  it.each`
    drawioUri                                     | expected
    ${undefined}                                  | ${'http://localhost/js/viewer.min.js'}
    ${'http://localhost:8080'}                    | ${'http://localhost:8080/js/viewer.min.js'}
    ${'http://example.com'}                       | ${'http://example.com/js/viewer.min.js'}
    ${'http://example.com/drawio'}                | ${'http://example.com/drawio/js/viewer.min.js'}
    ${'http://example.com/?offline=1&https=0'}    | ${'http://example.com/js/viewer.min.js?offline=1&https=0'}
  `('should return the expected URL "$expected" when drawioUri is "$drawioUrk"', ({ drawioUri, expected }: {drawioUri: string|undefined, expected: string}) => {
    // Arrange
    mocks.useRendererConfigMock.mockImplementation(() => {
      return { data: { drawioUri } };
    });

    // Act
    const url = useViewerMinJsUrl();

    // Assert
    expect(url).toBe(expected);
  });
});
