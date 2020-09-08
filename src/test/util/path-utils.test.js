const { isTopPage, convertToNewAffiliationPath } = require('../../lib/util/path-utils');


describe('TopPage Path test', () => {
  test('Path is only "/"', () => {
    const result = isTopPage('/');
    expect(result).toBe(true);
  });
  test('Path is not match string ', () => {
    const result = isTopPage('/test');
    expect(result).toBe(false);
  });
  test('Path is integer', () => {
    const result = isTopPage(1);
    expect(result).toBe(false);
  });
  test('Path is null', () => {
    const result = isTopPage(null);
    expect(result).toBe(false);
  });
});


describe('convertToNewAffiliationPath test', () => {
  test('Child path does not converted normally', () => {
    const result = convertToNewAffiliationPath('parent/', 'parent2/', 'parent/child');
    expect(result).toBe('parent2/child');
  });
  test('Parent path does not converted normally', () => {
    const result = convertToNewAffiliationPath('parent/', 'parent3/', 'parent/child');
    expect(result === 'parent/child').toBe(false);
  });

  test('Parent and Child path names are switched unexpectedly', () => {
    const result = convertToNewAffiliationPath('parent/', 'parent4/', 'parent/child');
    expect(result === 'child/parent4').toBe(false);
  });

  test('Child path is null', () => {
    expect(() => {
      convertToNewAffiliationPath('parent/', 'parent5/', null);
    }).toThrow();
  });

  test('Old parent path is null', () => {
    expect(() => {
      convertToNewAffiliationPath(null, 'parent5/', 'child');
    }).toThrow();
  });

  // test('New parent path is null', () => {
  //   expect(() => {
  //     convertToNewAffiliationPath('parent/', null, 'child');
  //   }).toThrow();
  // });
  test('New parent path is null', () => {
    const result = convertToNewAffiliationPath('parent/', null, 'parent/child');
    expect(result).toBe('nullchild');
  });

  test('All pathes are null', () => {
    expect(() => {
      convertToNewAffiliationPath(null, null, null);
    }).toThrow();
  });

});
