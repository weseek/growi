import { retrieveSiteUrl, validateReferer } from './validate-referer';

const mocks = vi.hoisted(() => {
  return {
    configManagerMock: {
      getConfig: vi.fn(),
    },
  };
});

vi.mock('~/server/service/config-manager', () => {
  return { configManager: mocks.configManagerMock };
});


describe('retrieveSiteUrl', () => {

  it('throw a parse error when the siteUrl is invalid', () => {
    // setup
    mocks.configManagerMock.getConfig.mockImplementation(() => {
      return 'invalid siteUrl string';
    });

    // when
    expect(() => retrieveSiteUrl()).toThrowError();
  });

  it('returns a URL instance', () => {
    // setup
    const siteUrl = 'https://example.com';
    mocks.configManagerMock.getConfig.mockImplementation(() => siteUrl);

    // when
    const result = retrieveSiteUrl();

    // then
    expect(result).toEqual(new URL(siteUrl));
  });

});


describe('validateReferer', () => {

  describe('refurns false', () => {

    it('when the referer argument is undefined', () => {
      // when
      const result = validateReferer(undefined);

      // then
      expect(result).toBeFalsy();
      expect(mocks.configManagerMock.getConfig).not.toHaveBeenCalled(); // getConfig have not been called
    });

    it('when the siteUrl is not set', () => {
      // setup
      mocks.configManagerMock.getConfig.mockImplementation(() => {
        return null;
      });

      // when
      const refererString = 'referer string';
      const result = validateReferer(refererString);

      // then
      expect(result).toBeFalsy();
      expect(mocks.configManagerMock.getConfig).toHaveBeenCalledWith('crowi', 'app:siteUrl');
      expect(mocks.configManagerMock.getConfig).toHaveBeenCalledOnce();
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
