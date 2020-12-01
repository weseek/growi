import checkTemplatePath from '~/utils/template-checker';

describe('.checkTemplatePath', () => {
  test('should be template page', () => {
    expect(checkTemplatePath('/_template')).toBeTruthy();
    expect(checkTemplatePath('/__template')).toBeTruthy();
    expect(checkTemplatePath('hoge/_template')).toBeTruthy();
    expect(checkTemplatePath('__template/_template')).toBeTruthy();
  });

  test('should not be template page', () => {
    expect(checkTemplatePath('_template')).toBeFalsy();
    expect(checkTemplatePath('__template')).toBeFalsy();
    expect(checkTemplatePath('/template')).toBeFalsy();
    expect(checkTemplatePath('/___template')).toBeFalsy();
    expect(checkTemplatePath('/_templatehoge')).toBeFalsy();
  });
});
