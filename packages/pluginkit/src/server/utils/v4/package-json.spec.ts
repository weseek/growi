import path from 'path';

import { importPackageJson, validatePackageJson } from './package-json';

it('importPackageJson() returns an object', async() => {
  // when
  const pkg = await importPackageJson(path.resolve(__dirname, '../../../../test/fixtures/example-package/template1'));

  // then
  expect(pkg).not.toBeNull();
});

it('validatePackageJson() returns a data object', async() => {
  // when
  const data = await validatePackageJson(path.resolve(__dirname, '../../../../test/fixtures/example-package/template1'));

  // then
  expect(data).not.toBeNull();
});
