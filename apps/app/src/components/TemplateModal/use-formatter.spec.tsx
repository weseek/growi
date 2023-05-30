import { useFormatter } from './use-formatter';


const mocks = vi.hoisted(() => {
  return {
    useCurrentPagePathMock: vi.fn(() => { return {} }),
  };
});

vi.mock('~/stores/page', () => {
  return { useCurrentPagePath: mocks.useCurrentPagePathMock };
});


describe('useFormatter', () => {

  describe('format()', () => {

    it('returns an empty string when the argument is undefined', () => {
      // setup
      const mastacheMock = {
        render: vi.fn(),
      };
      vi.doMock('mustache', () => mastacheMock);

      // when
      const { format } = useFormatter();
      const markdown = format(undefined);

      // then
      expect(markdown).toBe('');
      expect(mastacheMock.render).not.toHaveBeenCalled();
    });

  });
});
