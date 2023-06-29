import path from 'path';

import { importPackageJson } from './import';

it('importPackageJson() returns an object', async() => {
  // when
  const pkg = await importPackageJson(path.resolve(__dirname, '../../../../../test/fixtures/example-package/template1'));

  // then
  expect(pkg).not.toBeNull();
});
