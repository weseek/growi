import envUtils from '~/utils/env-utils';


describe('env-utils', () => {
  describe('.toBoolean', () => {

    test('should convert to true', () => {
      expect(envUtils.toBoolean('true')).toBe(true);
      expect(envUtils.toBoolean('True')).toBe(true);
      expect(envUtils.toBoolean(1)).toBe(true);
    });

    test('should convert to false', () => {
      expect(envUtils.toBoolean(undefined)).toBe(false);
      expect(envUtils.toBoolean(null)).toBe(false);
      expect(envUtils.toBoolean('false')).toBe(false);
      expect(envUtils.toBoolean(0)).toBe(false);
    });

  });
});
