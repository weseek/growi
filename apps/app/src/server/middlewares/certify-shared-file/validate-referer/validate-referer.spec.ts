import { validateReferer } from './validate-referer';

const mocks = vi.hoisted(() => {
  return {
    retrieveSiteUrlMock: vi.fn(),
  };
});

vi.mock('./retrieve-site-url', () => ({ retrieveSiteUrl: mocks.retrieveSiteUrlMock }));


describe('validateReferer', () => {

  describe('refurns false', () => {

    it('when the referer argument is undefined', () => {
      // setup

      // when
      const result = validateReferer(undefined);

      // then
      expect(result).toBeFalsy();
      expect(mocks.retrieveSiteUrlMock).not.toHaveBeenCalled();
    });

    it('when the referer is invalid', () => {
      // when
      const result = validateReferer('invalid URL');

      // then
      expect(result).toBeFalsy();
      expect(mocks.retrieveSiteUrlMock).not.toHaveBeenCalledOnce();
    });

    it('when the siteUrl returns null', () => {
      // setup
      mocks.retrieveSiteUrlMock.mockImplementation(() => {
        return null;
      });

      // when
      const refererString = 'https://example.org/share/xxxxx';
      const result = validateReferer(refererString);

      // then
      expect(result).toBeFalsy();
      expect(mocks.retrieveSiteUrlMock).toHaveBeenCalledOnce();
    });

    it('when the domain of the referer does not match with siteUrl', () => {
      // setup
      const siteUrl = 'https://example.com';
      mocks.configManagerMock.getConfig.mockImplementation(() => {
        return siteUrl;
      });

      // when
      const shareLinkId = '65436ba09ae6983bd608b89c';
      const refererString = `https://example.org/share/${shareLinkId}`;
      const result = validateReferer(refererString);

      // then
      expect(result).toBeFalsy();
      expect(mocks.configManagerMock.getConfig).toHaveBeenCalledWith('crowi', 'app:siteUrl');
      expect(mocks.configManagerMock.getConfig).toHaveBeenCalledOnce();
    });

  });

  it('returns ValidReferer instance', () => {
    // when
    const shareLinkId = '65436ba09ae6983bd608b89c';
    const refererString = `https://example.com/share/${shareLinkId}`;
    const result = validateReferer(refererString);

    // then
    expect(result).toStrictEqual({
      referer: refererString,
      shareLinkId,
    });
  });

});
