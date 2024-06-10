import { tagNames, attributes } from './recommended-whitelist';

describe('recommended-whitelist', () => {

  test('.tagNames should return iframe tag', () => {
    expect(tagNames).not.toBeNull();
    expect(tagNames).includes('iframe');
  });

  test('.tagNames should return video tag', () => {
    expect(tagNames).not.toBeNull();
    expect(tagNames).includes('video');
  });

  test('.attributes should return data attributes', () => {
    expect(attributes).not.toBeNull();
    expect(Object.keys(attributes)).includes('*');
    expect(attributes['*']).includes('data*');
  });

  test('.attributes should return iframe attributes', () => {
    expect(attributes).not.toBeNull();
    expect(Object.keys(attributes)).includes('iframe');
    expect(attributes.iframe).includes('src');
  });

  test('.attributes should return video attributes', () => {
    expect(attributes).not.toBeNull();
    expect(Object.keys(attributes)).includes('video');
    expect(attributes.iframe).includes('src');
  });

});
