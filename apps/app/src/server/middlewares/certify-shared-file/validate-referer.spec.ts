import { validateReferer } from './validate-referer';

describe('validateReferer', () => {

  describe('refurns false', () => {

    it('when the referer argument is undefined', () => {
      // when
      const result = validateReferer(undefined);

      // then
      expect(result).toBeFalsy();
    });

  });

  it('returns ValidReferer instance', () => {
    // setup
    const shareLinkId = '65436ba09ae6983bd608b89c';
    const refererString = `https://example.com/share/${shareLinkId}`;

    // when
    const result = validateReferer(refererString);

    // then
    expect(result).toStrictEqual({
      referer: refererString,
      shareLinkId,
    });
  });

});
