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
    drawioUri  | expected
    ${undefined}      | ${'http://localhost/js/viewer.min.js'}
  `('should return the expected URL "$expected" when drawioUri is "$drawioUrk"', () => {
    // Arrange
    // Act
    // Assert
  });
});
