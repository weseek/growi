import { isValidEmailDomain } from '~/utils';

describe('email-domain-utils', () => {
  test('should return true if valid email domin input', () => {
    expect(isValidEmailDomain('@growi.org')).toBe(true);
    expect(isValidEmailDomain('@growi-DOAIN-123.org')).toBe(true);
    expect(isValidEmailDomain('@growi-DOAIN-123.subdomain.org')).toBe(true);
  });

  test('should return false if invalid input', () => {
    expect(isValidEmailDomain('growi.org')).toBe(false);
    expect(isValidEmailDomain('@growi')).toBe(false);
    expect(isValidEmailDomain('@グローウィ.org')).toBe(false);
    expect(isValidEmailDomain('@-growi.org')).toBe(false);
    expect(isValidEmailDomain('@growi-.org')).toBe(false);
    expect(isValidEmailDomain('@morethan63-looooooooooooooooooooooooooooooooooooooooooooooooooog.org')).toBe(false);
    expect(isValidEmailDomain('@growi.morethan6')).toBe(false);
  });
});
