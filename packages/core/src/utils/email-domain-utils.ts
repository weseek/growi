/**
 * 1. Must start with an "@"
 * 2. Domain name must be a-z | A-Z | 0-9 and hyphen (-)
 * 3. Do not use hyphens (-) at the beginning or end of the domain name (e.g. -example.com or example-.com)
 * 4. Domain name length must be 1-63 characters
 * 5. Domain name can be a subdomain
 * 6. Last Tld must be at least 2 and no more than 6 characters and no hyphen (-)
 * 7. Total length must be less than 253 characters excluding "@"
 * ref: https://www.nic.ad.jp/ja/dom/system.html
 * see: https://regex101.com/r/xUJnJ4/1
 */
export const isValidEmailDomain = (emailDomain: string): boolean => {
  // eslint-disable-next-line regex/invalid
  const pattern = /^@(?=.{1,253}$)((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z0-9]{2,6}$/;
  return pattern.test(emailDomain);
};
